import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withAuth, isAuthError } from '@/lib/middleware';

// Update a recipe
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await withAuth(req);
  if (isAuthError(auth)) return auth;
  const { id } = await params;

  // Verify recipe belongs to user's plan
  const existing = await prisma.recipe.findUnique({
    where: { id },
    include: { plan: { select: { userId: true } } },
  });
  if (!existing || existing.plan.userId !== auth.user.id) {
    return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
  }

  const body = await req.json();
  const recipe = await prisma.recipe.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.category !== undefined && { category: body.category }),
      ...(body.yieldAmount !== undefined && { yieldAmount: body.yieldAmount }),
      ...(body.yieldUnit !== undefined && { yieldUnit: body.yieldUnit }),
      ...(body.prepTime !== undefined && { prepTime: body.prepTime }),
      ...(body.bakeTime !== undefined && { bakeTime: body.bakeTime }),
      ...(body.temperature !== undefined && { temperature: body.temperature }),
      ...(body.temperatureUnit !== undefined && { temperatureUnit: body.temperatureUnit }),
      ...(body.ingredients !== undefined && { ingredients: body.ingredients }),
      ...(body.instructions !== undefined && { instructions: body.instructions }),
      ...(body.notes !== undefined && { notes: body.notes }),
    },
  });

  return NextResponse.json({ recipe });
}

// Delete a recipe
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await withAuth(req);
  if (isAuthError(auth)) return auth;
  const { id } = await params;

  const existing = await prisma.recipe.findUnique({
    where: { id },
    include: { plan: { select: { userId: true } } },
  });
  if (!existing || existing.plan.userId !== auth.user.id) {
    return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
  }

  await prisma.recipe.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
