import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withAuth, isAuthError } from '@/lib/middleware';

// List plans
export async function GET(req: NextRequest) {
  const auth = await withAuth(req);
  if (isAuthError(auth)) return auth;

  const plans = await prisma.businessPlan.findMany({
    where: { userId: auth.user.id },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      name: true,
      businessType: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ plans });
}

// Create plan
export async function POST(req: NextRequest) {
  const auth = await withAuth(req);
  if (isAuthError(auth)) return auth;

  // Free tier: max 1 plan
  if (auth.user.planTier === 'FREE') {
    const count = await prisma.businessPlan.count({ where: { userId: auth.user.id } });
    if (count >= 1) {
      return NextResponse.json(
        { error: 'Free tier allows only 1 business plan. Upgrade for more.' },
        { status: 403 }
      );
    }
  }

  const body = await req.json();
  const plan = await prisma.businessPlan.create({
    data: {
      userId: auth.user.id,
      name: body.name || 'Untitled Plan',
      businessType: body.businessType || 'bakery',
      formData: body.formData || {},
    },
    select: {
      id: true,
      name: true,
      businessType: true,
      formData: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ plan }, { status: 201 });
}
