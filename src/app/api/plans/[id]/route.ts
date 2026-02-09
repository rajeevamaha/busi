import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withAuth, isAuthError } from '@/lib/middleware';

// Get plan
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await withAuth(req);
  if (isAuthError(auth)) return auth;
  const { id } = await params;

  const plan = await prisma.businessPlan.findFirst({
    where: { id, userId: auth.user.id },
  });

  if (!plan) {
    return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
  }

  return NextResponse.json({ plan });
}

// Update plan
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await withAuth(req);
  if (isAuthError(auth)) return auth;
  const { id } = await params;

  const existing = await prisma.businessPlan.findFirst({
    where: { id, userId: auth.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
  }

  const body = await req.json();
  const plan = await prisma.businessPlan.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.businessType !== undefined && { businessType: body.businessType }),
      ...(body.formData !== undefined && { formData: body.formData }),
    },
  });

  return NextResponse.json({ plan });
}

// Delete plan
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await withAuth(req);
  if (isAuthError(auth)) return auth;
  const { id } = await params;

  const existing = await prisma.businessPlan.findFirst({
    where: { id, userId: auth.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
  }

  await prisma.businessPlan.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
