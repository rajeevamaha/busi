'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useBusinessPlanStore } from '@/stores/business-plan-store';
import { RecipeCard } from './recipe-card';
import { RecipeDialog } from './recipe-dialog';
import { RecipeDetailDialog } from './recipe-detail-dialog';

export interface RecipeIngredient {
  name: string;
  quantity: string;
  unit: string;
}

export interface Recipe {
  id: string;
  name: string;
  category: string;
  yieldAmount: string;
  yieldUnit: string;
  prepTime: number;
  bakeTime: number;
  temperature: number;
  temperatureUnit: 'F' | 'C';
  ingredients: RecipeIngredient[];
  instructions: string;
  notes: string;
  createdAt: string;
}

const STORAGE_KEY_PREFIX = 'busibldr-recipes-';

function getStorageKey(planId: string) {
  return `${STORAGE_KEY_PREFIX}${planId}`;
}

export function RecipeBuilderPage() {
  const planId = useBusinessPlanStore((s) => s.planId);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [viewingRecipe, setViewingRecipe] = useState<Recipe | null>(null);

  // Load recipes from localStorage
  useEffect(() => {
    if (!planId) return;
    const stored = localStorage.getItem(getStorageKey(planId));
    if (stored) {
      try {
        setRecipes(JSON.parse(stored));
      } catch {
        setRecipes([]);
      }
    }
  }, [planId]);

  // Save recipes to localStorage
  function saveRecipes(updated: Recipe[]) {
    setRecipes(updated);
    if (planId) {
      localStorage.setItem(getStorageKey(planId), JSON.stringify(updated));
    }
  }

  function handleAddRecipe(recipe: Omit<Recipe, 'id' | 'createdAt'>) {
    const newRecipe: Recipe = {
      ...recipe,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    saveRecipes([newRecipe, ...recipes]);
    setShowAddDialog(false);
  }

  function handleUpdateRecipe(recipe: Omit<Recipe, 'id' | 'createdAt'>) {
    if (!editingRecipe) return;
    const updated = recipes.map((r) =>
      r.id === editingRecipe.id ? { ...r, ...recipe } : r
    );
    saveRecipes(updated);
    setEditingRecipe(null);
  }

  function handleDeleteRecipe(id: string) {
    saveRecipes(recipes.filter((r) => r.id !== id));
    setViewingRecipe(null);
  }

  return (
    <ScrollArea className="h-[calc(100vh-7rem)]">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Recipe Builder</h2>
            <p className="text-muted-foreground mt-1">
              Organize and manage all your baking recipes in one place.
            </p>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="size-4 mr-1" />
            Add Recipe
          </Button>
        </div>

        {recipes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="rounded-full bg-muted p-6 mb-4">
              <Plus className="size-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No recipes yet</h3>
            <p className="text-muted-foreground mt-1 max-w-sm">
              Start building your recipe collection. Click &quot;Add Recipe&quot; to create your first recipe.
            </p>
            <Button className="mt-4" onClick={() => setShowAddDialog(true)}>
              <Plus className="size-4 mr-1" />
              Add Your First Recipe
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onClick={() => setViewingRecipe(recipe)}
                onEdit={() => setEditingRecipe(recipe)}
                onDelete={() => handleDeleteRecipe(recipe.id)}
              />
            ))}
          </div>
        )}

        {/* Add Recipe Dialog */}
        <RecipeDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          onSave={handleAddRecipe}
          title="Add New Recipe"
        />

        {/* Edit Recipe Dialog */}
        <RecipeDialog
          open={!!editingRecipe}
          onOpenChange={(open) => { if (!open) setEditingRecipe(null); }}
          onSave={handleUpdateRecipe}
          title="Edit Recipe"
          defaultValues={editingRecipe ?? undefined}
        />

        {/* View Recipe Detail Dialog */}
        <RecipeDetailDialog
          recipe={viewingRecipe}
          open={!!viewingRecipe}
          onOpenChange={(open) => { if (!open) setViewingRecipe(null); }}
          onEdit={() => {
            if (viewingRecipe) {
              setEditingRecipe(viewingRecipe);
              setViewingRecipe(null);
            }
          }}
          onDelete={() => {
            if (viewingRecipe) handleDeleteRecipe(viewingRecipe.id);
          }}
        />
      </div>
    </ScrollArea>
  );
}
