'use client';

import { Clock, Flame, Pencil, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { Recipe } from './recipe-builder-page';

interface RecipeDetailDialogProps {
  recipe: Recipe | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}

const categoryColors: Record<string, string> = {
  bread: 'bg-amber-100 text-amber-800',
  cake: 'bg-pink-100 text-pink-800',
  pastry: 'bg-purple-100 text-purple-800',
  cookie: 'bg-orange-100 text-orange-800',
  pie: 'bg-blue-100 text-blue-800',
  other: 'bg-gray-100 text-gray-800',
};

export function RecipeDetailDialog({
  recipe,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: RecipeDetailDialogProps) {
  if (!recipe) return null;

  const totalTime = recipe.prepTime + recipe.bakeTime;
  const colorClass = categoryColors[recipe.category] || categoryColors.other;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <div className="flex items-start justify-between pr-8">
            <div>
              <Badge variant="outline" className={`${colorClass} border-0 text-[10px] mb-2`}>
                {recipe.category.charAt(0).toUpperCase() + recipe.category.slice(1)}
              </Badge>
              <DialogTitle className="text-xl">{recipe.name}</DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-5 py-4">
            {/* Meta info */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Clock className="size-4" />
                Prep: {recipe.prepTime} min
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="size-4" />
                Bake: {recipe.bakeTime} min
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="size-4" />
                Total: {totalTime} min
              </span>
              <span className="flex items-center gap-1.5">
                <Flame className="size-4" />
                {recipe.temperature}&deg;{recipe.temperatureUnit}
              </span>
            </div>

            <div className="rounded-lg bg-muted/50 px-4 py-3">
              <p className="text-sm">
                <span className="font-medium">Yields:</span> {recipe.yieldAmount} {recipe.yieldUnit}
              </p>
            </div>

            {/* Ingredients */}
            <Separator />
            <div>
              <h3 className="font-semibold mb-3">Ingredients</h3>
              <div className="space-y-1.5">
                {recipe.ingredients.map((ing, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-sm py-1 border-b border-dashed last:border-0"
                  >
                    <span className="size-1.5 rounded-full bg-primary shrink-0" />
                    <span className="font-medium">{ing.quantity} {ing.unit}</span>
                    <span className="text-muted-foreground">{ing.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions */}
            {recipe.instructions && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-3">Instructions</h3>
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {recipe.instructions}
                  </div>
                </div>
              </>
            )}

            {/* Notes */}
            {recipe.notes && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-3">Notes</h3>
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap bg-yellow-50 rounded-lg p-3">
                    {recipe.notes}
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        <div className="px-6 py-4 border-t flex justify-between">
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={onDelete}
          >
            <Trash2 className="size-3.5 mr-1" />
            Delete
          </Button>
          <Button size="sm" onClick={onEdit}>
            <Pencil className="size-3.5 mr-1" />
            Edit Recipe
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
