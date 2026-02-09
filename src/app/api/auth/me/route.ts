import { NextRequest, NextResponse } from 'next/server';
import { withAuth, isAuthError } from '@/lib/middleware';

export async function GET(req: NextRequest) {
  const result = await withAuth(req);
  if (isAuthError(result)) return result;

  return NextResponse.json({ user: result.user });
}
