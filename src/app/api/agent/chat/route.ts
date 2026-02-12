import { NextRequest } from 'next/server';
import { streamText, createUIMessageStreamResponse, stepCountIs, convertToModelMessages } from 'ai';
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

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid request body' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { messages, planId, role = 'ceo' } = body;

  if (!planId) {
    return new Response(
      JSON.stringify({ error: 'planId is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Convert UIMessages to model messages (properly handles tool calls/results)
  let modelMessages;
  try {
    modelMessages = await convertToModelMessages(messages, {
      ignoreIncompleteToolCalls: true,
    });
  } catch (err) {
    console.error('[Agent] Message conversion error:', err);
    // Fallback: extract text-only messages
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    modelMessages = messages.map((msg: any) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.parts
        ?.filter((p: { type: string }) => p.type === 'text')
        .map((p: { text: string }) => p.text)
        .join('') || msg.content || '',
    })).filter((m: { content: string }) => m.content.length > 0);
  }

  // Extract last user text for routing and saving
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lastUserText = messages
    .filter((m: any) => m.role === 'user')
    .pop()?.parts
    ?.filter((p: { type: string }) => p.type === 'text')
    .map((p: { text: string }) => p.text)
    .join('') || '';

  const useTools = shouldUseTools(
    // Simple format for routing check only
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    messages.map((msg: any) => ({
      role: msg.role as string,
      content: msg.parts
        ?.filter((p: { type: string }) => p.type === 'text')
        .map((p: { text: string }) => p.text)
        .join('') || '',
    }))
  );

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

  // All interactions use Groq (free tier)
  // Tool-calling uses llama-3.3-70b-versatile which supports function calling
  const AGENT_MODEL = 'llama-3.3-70b-versatile';

  if (useTools) {
    // Agent mode: Groq with tools
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tools = createToolsForRole(planId, auth.user.id, agentRole) as any;

    const result = streamText({
      model: groq(AGENT_MODEL),
      system: systemPrompt,
      messages: modelMessages,
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
                model: AGENT_MODEL,
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
        modelUsed: AGENT_MODEL,
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
      messages: modelMessages,
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
