import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromHeaders, JWTPayload } from './auth';
import { prisma } from './db';

export interface AuthenticatedRequest {
  user: {
    id: string;
    email: string;
    planTier: string;
  };
}

export async function withAuth(
  req: NextRequest
): Promise<AuthenticatedRequest | NextResponse> {
  const token = getTokenFromHeaders(req.headers);
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload: JWTPayload | null = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, planTier: true },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 401 });
  }

  return { user };
}

export function isAuthError(result: AuthenticatedRequest | NextResponse): result is NextResponse {
  return result instanceof NextResponse;
}
