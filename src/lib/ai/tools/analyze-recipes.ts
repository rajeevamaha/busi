import { tool, type Tool } from 'ai';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { formatCurrency } from '@/lib/utils';

interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
  costPerUnit: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createAnalyzeRecipes(planId: string, userId: string): Tool<any, any> {
  return (tool as any)({
    description: `Analyze recipes from the plan's recipe book for cost per unit, margin per recipe, and highest-cost ingredients. Use when the user asks about recipe costs, menu engineering, or food cost optimization.`,
    parameters: z.object({
      recipeName: z.string().optional().describe('Specific recipe name to analyze, or omit for all recipes'),
    }),
    execute: async ({ recipeName }: { recipeName?: string }) => {
      const plan = await prisma.businessPlan.findFirst({
        where: { id: planId, userId },
        select: { id: true },
      });
      if (!plan) return { error: 'Plan not found' };

      const where: Record<string, unknown> = { planId };
      if (recipeName) {
        where.name = { contains: recipeName, mode: 'insensitive' };
      }

      const recipes = await prisma.recipe.findMany({ where });

      if (recipes.length === 0) {
        return {
          error: recipeName
            ? `No recipe found matching "${recipeName}".`
            : 'No recipes found. Add recipes in the Recipe Builder first.',
        };
      }

      const analyzed = recipes.map(recipe => {
        const ingredients = (recipe.ingredients as unknown as Ingredient[]) || [];
        const totalCost = ingredients.reduce((sum, ing) => sum + (ing.quantity * ing.costPerUnit), 0);
        const yieldNum = parseFloat(recipe.yieldAmount) || 1;
        const costPerUnit = totalCost / yieldNum;

        const sortedByExpense = [...ingredients]
          .map(ing => ({ name: ing.name, cost: ing.quantity * ing.costPerUnit }))
          .sort((a, b) => b.cost - a.cost);

        return {
          name: recipe.name,
          category: recipe.category,
          yield: `${recipe.yieldAmount} ${recipe.yieldUnit}`,
          totalIngredientCost: formatCurrency(totalCost),
          costPerUnit: formatCurrency(costPerUnit),
          costPerUnitRaw: costPerUnit,
          ingredientCount: ingredients.length,
          topCostIngredients: sortedByExpense.slice(0, 3).map(i => ({
            name: i.name,
            cost: formatCurrency(i.cost),
          })),
        };
      });

      const allCosts = analyzed.map(r => r.costPerUnitRaw);
      const avgCost = allCosts.length > 0 ? allCosts.reduce((a, b) => a + b, 0) / allCosts.length : 0;

      return {
        recipeCount: analyzed.length,
        avgCostPerUnit: formatCurrency(avgCost),
        recipes: analyzed.map(({ costPerUnitRaw, ...rest }) => rest),
      };
    },
  });
}
