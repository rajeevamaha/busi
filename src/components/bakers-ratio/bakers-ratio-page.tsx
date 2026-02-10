'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface Ingredient {
  name: string;
  weight: number;
}

const defaultIngredients: Ingredient[] = [
  { name: 'Flour', weight: 1000 },
  { name: 'Water', weight: 600 },
  { name: 'Sugar', weight: 200 },
  { name: 'Butter', weight: 150 },
  { name: 'Eggs', weight: 100 },
  { name: 'Salt', weight: 20 },
  { name: 'Yeast', weight: 10 },
];

export function BakersRatioPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>(defaultIngredients);
  const [newName, setNewName] = useState('');
  const [newWeight, setNewWeight] = useState('');

  const flourWeight = ingredients.find((i) => i.name.toLowerCase() === 'flour')?.weight || 0;

  function getBakersPercent(weight: number): string {
    if (flourWeight === 0) return '0.0';
    return ((weight / flourWeight) * 100).toFixed(1);
  }

  function updateWeight(index: number, value: string) {
    const updated = [...ingredients];
    updated[index].weight = parseFloat(value) || 0;
    setIngredients(updated);
  }

  function addIngredient() {
    if (!newName.trim()) return;
    setIngredients([...ingredients, { name: newName.trim(), weight: parseFloat(newWeight) || 0 }]);
    setNewName('');
    setNewWeight('');
  }

  function removeIngredient(index: number) {
    setIngredients(ingredients.filter((_, i) => i !== index));
  }

  const totalWeight = ingredients.reduce((sum, i) => sum + i.weight, 0);

  return (
    <ScrollArea className="h-[calc(100vh-7rem)]">
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Baker&apos;s Ratio Calculator</h2>
          <p className="text-muted-foreground mt-1">
            Baker&apos;s percentage expresses each ingredient&apos;s weight as a percentage of the flour weight.
            Flour is always 100%.
          </p>
        </div>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <h3 className="font-semibold text-blue-900 mb-2">How it works</h3>
            <p className="text-sm text-blue-800">
              <strong>Baker&apos;s % = (Ingredient Weight &divide; Flour Weight) &times; 100</strong>
            </p>
            <p className="text-sm text-blue-700 mt-2">
              For example, if you use 600g water and 1000g flour, the water percentage is 60%.
              This makes it easy to scale recipes up or down while keeping proportions consistent.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recipe Ingredients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Header */}
              <div className="grid grid-cols-[1fr_120px_100px_40px] gap-3 text-xs font-medium text-muted-foreground px-1">
                <span>Ingredient</span>
                <span>Weight (g)</span>
                <span>Baker&apos;s %</span>
                <span></span>
              </div>

              <Separator />

              {/* Ingredients */}
              {ingredients.map((ing, i) => (
                <div key={i} className="grid grid-cols-[1fr_120px_100px_40px] gap-3 items-center">
                  <span className={`text-sm ${ing.name.toLowerCase() === 'flour' ? 'font-semibold' : ''}`}>
                    {ing.name}
                  </span>
                  <Input
                    type="number"
                    min="0"
                    value={ing.weight || ''}
                    onChange={(e) => updateWeight(i, e.target.value)}
                    className="h-8 text-sm"
                  />
                  <span className={`text-sm font-medium px-2 py-1 rounded ${
                    ing.name.toLowerCase() === 'flour'
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted'
                  }`}>
                    {getBakersPercent(ing.weight)}%
                  </span>
                  {ing.name.toLowerCase() !== 'flour' ? (
                    <button
                      onClick={() => removeIngredient(i)}
                      className="text-red-400 hover:text-red-600 text-sm"
                    >
                      &times;
                    </button>
                  ) : <span />}
                </div>
              ))}

              <Separator />

              {/* Add new */}
              <div className="grid grid-cols-[1fr_120px_100px_40px] gap-3 items-center">
                <Input
                  placeholder="New ingredient"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="h-8 text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && addIngredient()}
                />
                <Input
                  type="number"
                  placeholder="Weight"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  className="h-8 text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && addIngredient()}
                />
                <button
                  onClick={addIngredient}
                  className="text-sm text-primary hover:underline text-left px-2"
                >
                  + Add
                </button>
                <span />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Total Weight</p>
                <p className="text-lg font-bold">{totalWeight.toLocaleString()}g</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Flour Weight</p>
                <p className="text-lg font-bold">{flourWeight.toLocaleString()}g</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Hydration</p>
                <p className="text-lg font-bold">
                  {getBakersPercent(ingredients.find((i) => i.name.toLowerCase() === 'water')?.weight || 0)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Common ratios reference */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Common Baker&apos;s Ratios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {[
                { name: 'White Bread', flour: 100, water: 60, salt: 2, yeast: 1 },
                { name: 'Pizza Dough', flour: 100, water: 65, salt: 2.5, yeast: 0.5 },
                { name: 'Croissant', flour: 100, water: 55, sugar: 12, butter: 27, yeast: 3 },
                { name: 'Cake (Pound)', flour: 100, sugar: 100, butter: 100, eggs: 100 },
                { name: 'Cookie', flour: 100, sugar: 75, butter: 65, eggs: 25 },
                { name: 'Brioche', flour: 100, water: 10, sugar: 15, butter: 50, eggs: 40, yeast: 3 },
              ].map((recipe) => (
                <div key={recipe.name} className="flex items-center justify-between py-1.5 border-b last:border-0">
                  <span className="font-medium">{recipe.name}</span>
                  <span className="text-muted-foreground text-xs">
                    {Object.entries(recipe)
                      .filter(([k]) => k !== 'name')
                      .map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)} ${v}%`)
                      .join(' · ')}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
