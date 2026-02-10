'use client';

import { Clock, Flame, Trash2, Pencil } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Recipe } from './recipe-builder-page';

interface RecipeCardProps {
  recipe: Recipe;
  onClick: () => void;
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

export function RecipeCard({ recipe, onClick, onEdit, onDelete }: RecipeCardProps) {
  const totalTime = recipe.prepTime + recipe.bakeTime;
  const colorClass = categoryColors[recipe.category] || categoryColors.other;

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow group relative"
      onClick={onClick}
    >
      <CardContent className="p-4">
        {/* Action buttons */}
        <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
            title="Edit recipe"
          >
            <Pencil className="size-3.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1.5 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-600"
            title="Delete recipe"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>

        {/* Category badge */}
        <Badge variant="outline" className={`${colorClass} border-0 text-[10px] mb-2`}>
          {recipe.category.charAt(0).toUpperCase() + recipe.category.slice(1)}
        </Badge>

        {/* Recipe name */}
        <h3 className="font-semibold text-base leading-tight mb-1 pr-14">{recipe.name}</h3>

        {/* Yield */}
        <p className="text-xs text-muted-foreground mb-3">
          Yields: {recipe.yieldAmount} {recipe.yieldUnit}
        </p>

        {/* Meta row */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="size-3" />
            {totalTime} min
          </span>
          <span className="flex items-center gap-1">
            <Flame className="size-3" />
            {recipe.temperature}&deg;{recipe.temperatureUnit}
          </span>
          <span>{recipe.ingredients.length} ingredients</span>
        </div>
      </CardContent>
    </Card>
  );
}
