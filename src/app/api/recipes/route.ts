import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { withAuth, isAuthError } from '@/lib/middleware';

// List recipes for a plan
export async function GET(req: NextRequest) {
  const auth = await withAuth(req);
  if (isAuthError(auth)) return auth;

  const planId = req.nextUrl.searchParams.get('planId');
  if (!planId) {
    return NextResponse.json({ error: 'planId required' }, { status: 400 });
  }

  // Verify plan belongs to user
  const plan = await prisma.businessPlan.findFirst({
    where: { id: planId, userId: auth.user.id },
  });
  if (!plan) {
    return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
  }

  const recipes = await prisma.recipe.findMany({
    where: { planId },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ recipes });
}

// Create a recipe
export async function POST(req: NextRequest) {
  const auth = await withAuth(req);
  if (isAuthError(auth)) return auth;

  const body = await req.json();
  const { planId, ...data } = body;

  if (!planId) {
    return NextResponse.json({ error: 'planId required' }, { status: 400 });
  }

  // Verify plan belongs to user
  const plan = await prisma.businessPlan.findFirst({
    where: { id: planId, userId: auth.user.id },
  });
  if (!plan) {
    return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
  }

  const recipe = await prisma.recipe.create({
    data: {
      planId,
      name: data.name || 'Untitled Recipe',
      category: data.category || 'other',
      yieldAmount: data.yieldAmount || '',
      yieldUnit: data.yieldUnit || 'pieces',
      prepTime: data.prepTime || 0,
      bakeTime: data.bakeTime || 0,
      temperature: data.temperature || 350,
      temperatureUnit: data.temperatureUnit || 'F',
      ingredients: data.ingredients || [],
      instructions: data.instructions || '',
      notes: data.notes || '',
    },
  });

  return NextResponse.json({ recipe }, { status: 201 });
}
