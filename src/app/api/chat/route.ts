import { NextRequest } from 'next/server';
import { streamText, createUIMessageStreamResponse } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { withAuth, isAuthError } from '@/lib/middleware';
import { prisma } from '@/lib/db';
import { buildSystemPrompt } from '@/lib/ai/prompt-builder';
import { routeModel, getModelId } from '@/lib/ai/model-router';
import { checkRateLimit } from '@/lib/ai/rate-limiter';
import { calculateMetrics } from '@/lib/engine/calculations';
import { calculateHealthScore } from '@/lib/engine/health-score';
import { runRules } from '@/lib/engine/rules';
import { runCompoundRules } from '@/lib/engine/compound-rules';
import { FormData, defaultFormData } from '@/lib/engine/types';

export async function POST(req: NextRequest) {
  const auth = await withAuth(req);
  if (isAuthError(auth)) return auth;

  const { messages, planId } = await req.json();

  // Rate limiting
  const rateCheck = checkRateLimit(auth.user.id, auth.user.planTier);
  if (!rateCheck.allowed) {
    return new Response(
      JSON.stringify({ error: 'Rate limit exceeded. Upgrade to paid plan for unlimited chat.' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Get plan data for context
  let formData: FormData = defaultFormData;
  if (planId) {
    const plan = await prisma.businessPlan.findFirst({
      where: { id: planId, userId: auth.user.id },
    });
    if (plan?.formData) {
      formData = plan.formData as unknown as FormData;
    }
  }

  // Compute metrics for system prompt
  const metrics = calculateMetrics(formData);
  const { score, breakdown } = calculateHealthScore(formData, metrics);
  metrics.healthScore = score;
  metrics.healthScoreBreakdown = breakdown;
  const alerts = runRules(formData, metrics);
  const insights = runCompoundRules(formData, metrics);

  // Route model
  const lastUserMessage = messages[messages.length - 1]?.content || '';
  const modelChoice = routeModel(lastUserMessage);
  const modelId = getModelId(modelChoice);

  const systemPrompt = buildSystemPrompt(formData, metrics, alerts, insights);

  const result = streamText({
    model: anthropic(modelId),
    system: systemPrompt,
    messages,
  });

  // Save messages asynchronously
  if (planId) {
    const userMsg = messages[messages.length - 1];
    if (userMsg) {
      prisma.chatMessage.create({
        data: {
          planId,
          role: 'user',
          content: userMsg.content || '',
          modelUsed: modelChoice,
        },
      }).catch(console.error);
    }
  }

  return createUIMessageStreamResponse({
    stream: result.toUIMessageStream(),
  });
}
