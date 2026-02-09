// Simple in-memory rate limiter for free tier
// In production, use Redis or database-backed rate limiting

const sessionCounts = new Map<string, { count: number; resetAt: number }>();

const FREE_TIER_LIMIT = 5;
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
