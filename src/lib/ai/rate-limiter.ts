// Simple in-memory rate limiter for free tier
// In production, use Redis or database-backed rate limiting

const sessionCounts = new Map<string, { count: number; resetAt: number }>();

const FREE_TIER_LIMIT = 50;
const SESSION_DURATION_MS = 60 * 60 * 1000; // 1 hour

export function checkRateLimit(userId: string, planTier: string): { allowed: boolean; remaining: number } {
  if (planTier === 'PAID') {
    return { allowed: true, remaining: Infinity };
  }

  const now = Date.now();
  const session = sessionCounts.get(userId);

  if (!session || now > session.resetAt) {
    sessionCounts.set(userId, { count: 1, resetAt: now + SESSION_DURATION_MS });
    return { allowed: true, remaining: FREE_TIER_LIMIT - 1 };
  }

  if (session.count >= FREE_TIER_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  session.count++;
  return { allowed: true, remaining: FREE_TIER_LIMIT - session.count };
}

// Agent-specific rate limiting (tool-calling interactions are more expensive)
const agentCounts = new Map<string, { count: number; resetAt: number }>();

const FREE_AGENT_LIMIT = 30;
const PAID_AGENT_LIMIT = 50;
const AGENT_SESSION_MS = 60 * 60 * 1000; // 1 hour

export function checkAgentRateLimit(userId: string, planTier: string): { allowed: boolean; remaining: number } {
  const limit = planTier === 'PAID' ? PAID_AGENT_LIMIT : FREE_AGENT_LIMIT;
  const now = Date.now();
  const session = agentCounts.get(userId);

  if (!session || now > session.resetAt) {
    agentCounts.set(userId, { count: 1, resetAt: now + AGENT_SESSION_MS });
    return { allowed: true, remaining: limit - 1 };
  }

  if (session.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  session.count++;
  return { allowed: true, remaining: limit - session.count };
}
