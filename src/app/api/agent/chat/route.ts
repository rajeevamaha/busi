import { NextRequest } from 'next/server';
import { streamText, createUIMessageStreamResponse, stepCountIs } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { groq } from '@ai-sdk/groq';
import { withAuth, isAuthError } from '@/lib/middleware';
import { prisma } from '@/lib/db';
import { buildAgentSystemPrompt } from '@/lib/ai/prompt-builder';
import { shouldUseTools, routeModel, getModelId } from '@/lib/ai/model-router';
import { checkAgentRateLimit } from '@/lib/ai/rate-limiter';
import { createToolsForRole, type AgentRole } from '@/lib/ai/tools';
import { calculateMetrics } from '@/lib/engine/calculations';
import { calculateHealthScore } from '@/lib/engine/health-score';
import { runRules } from '@/lib/engine/rules';
import { runCompoundRules } from '@/lib/engine/compound-rules';
import { FormData, defaultFormData } from '@/lib/engine/types';

export async function POST(req: NextRequest) {
  const auth = await withAuth(req);
  if (isAuthError(auth)) return auth;

  const { messages, planId, role = 'ceo' } = await req.json();

  if (!planId) {
    return new Response(
      JSON.stringify({ error: 'planId is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Convert UIMessages to simple format for routing
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const coreMessages = messages.map((msg: any) => ({
    role: msg.role as 'user' | 'assistant',
    content: msg.parts
      ?.filter((p: { type: string }) => p.type === 'text')
      .map((p: { text: string }) => p.text)
      .join('') || msg.content || '',
  }));

  const lastUserText = coreMessages.filter((m: { role: string }) => m.role === 'user').pop()?.content || '';
  const useTools = shouldUseTools(coreMessages);

  // Rate limit agent interactions
  if (useTools) {
    const rateCheck = checkAgentRateLimit(auth.user.id, auth.user.planTier);
    if (!rateCheck.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Agent rate limit exceeded. Upgrade for more agent interactions.',
          remaining: rateCheck.remaining,
        }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // Fetch plan data
  const plan = await prisma.businessPlan.findFirst({
    where: { id: planId, userId: auth.user.id },
  });

  if (!plan) {
    return new Response(
      JSON.stringify({ error: 'Plan not found' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const formData: FormData = { ...defaultFormData, ...(plan.formData as unknown as FormData) };
  const isOnboarding = !plan.onboardingComplete;
  const agentRole = (plan.role || role) as AgentRole;

  // Compute metrics for system prompt
  const metrics = calculateMetrics(formData);
  const { score, breakdown } = calculateHealthScore(formData, metrics);
  metrics.healthScore = score;
  metrics.healthScoreBreakdown = breakdown;
  const alerts = runRules(formData, metrics);
  const insights = runCompoundRules(formData, metrics);

  const systemPrompt = buildAgentSystemPrompt(
    formData, metrics, alerts, insights, agentRole, isOnboarding
  );

  if (useTools) {
    // Agent mode: Claude with tools
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tools = createToolsForRole(planId, auth.user.id, agentRole) as any;

    const result = streamText({
      model: anthropic('claude-sonnet-4-5-20250929'),
      system: systemPrompt,
      messages: coreMessages,
      tools,
      stopWhen: stepCountIs(5),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onStepFinish: async ({ toolCalls, toolResults }: any) => {
        if (toolCalls && toolCalls.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          for (const tc of toolCalls as any[]) {
            prisma.agentActivity.create({
              data: {
                planId,
                type: 'tool_call',
                toolName: tc.toolName,
                input: JSON.parse(JSON.stringify(tc.args ?? {})),
                output: JSON.parse(JSON.stringify(
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  toolResults?.find((tr: any) => tr.toolCallId === tc.toolCallId)?.result ?? null
                )),
                model: 'claude-sonnet-4-5',
              },
            }).catch(console.error);
          }
        }
      },
    });

    // Save user message async
    prisma.chatMessage.create({
      data: {
        planId,
        role: 'user',
        content: lastUserText,
        modelUsed: 'claude-sonnet',
        metadata: { role: agentRole, agentMode: true },
      },
    }).catch(console.error);

    return createUIMessageStreamResponse({
      stream: result.toUIMessageStream(),
    });
  } else {
    // Simple Q&A mode: Groq
    const modelChoice = routeModel(lastUserText);
    const modelId = getModelId(modelChoice);

    const result = streamText({
      model: groq(modelId),
      system: systemPrompt,
      messages: coreMessages,
    });

    prisma.chatMessage.create({
      data: {
        planId,
        role: 'user',
        content: lastUserText,
        modelUsed: modelChoice,
        metadata: { role: agentRole, agentMode: false },
      },
    }).catch(console.error);

    return createUIMessageStreamResponse({
      stream: result.toUIMessageStream(),
    });
  }
}
