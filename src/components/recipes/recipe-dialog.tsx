'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import type { Recipe, RecipeIngredient } from './recipe-builder-page';

interface RecipeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (recipe: Omit<Recipe, 'id' | 'createdAt'>) => void;
  title: string;
  defaultValues?: Recipe;
}

const emptyIngredient: RecipeIngredient = { name: '', quantity: '', unit: 'g' };

interface RecipeFormState {
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
}

const defaultRecipe: RecipeFormState = {
  name: '',
  category: 'bread',
  yieldAmount: '',
  yieldUnit: 'pieces',
  prepTime: 30,
  bakeTime: 30,
  temperature: 350,
  temperatureUnit: 'F',
  ingredients: [
    { name: 'Flour', quantity: '', unit: 'g' },
    { name: '', quantity: '', unit: 'g' },
  ],
  instructions: '',
  notes: '',
};

const units = ['g', 'kg', 'oz', 'lb', 'ml', 'L', 'cup', 'tbsp', 'tsp', 'pcs'];
const categories = ['bread', 'cake', 'pastry', 'cookie', 'pie', 'other'];

export function RecipeDialog({
  open,
  onOpenChange,
  onSave,
  title,
  defaultValues,
}: RecipeDialogProps) {
  const [form, setForm] = useState<RecipeFormState>(defaultRecipe);

  useEffect(() => {
    if (open && defaultValues) {
      setForm({
        name: defaultValues.name,
        category: defaultValues.category,
        yieldAmount: defaultValues.yieldAmount,
        yieldUnit: defaultValues.yieldUnit,
        prepTime: defaultValues.prepTime,
        bakeTime: defaultValues.bakeTime,
        temperature: defaultValues.temperature,
        temperatureUnit: defaultValues.temperatureUnit,
        ingredients: defaultValues.ingredients.length > 0
          ? defaultValues.ingredients
          : [{ ...emptyIngredient }],
        instructions: defaultValues.instructions,
        notes: defaultValues.notes,
      });
    } else if (open && !defaultValues) {
      setForm({ ...defaultRecipe, ingredients: [{ name: 'Flour', quantity: '', unit: 'g' }, { name: '', quantity: '', unit: 'g' }] });
    }
  }, [open, defaultValues]);

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateIngredient(index: number, field: keyof RecipeIngredient, value: string) {
    const updated = [...form.ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setForm((prev) => ({ ...prev, ingredients: updated }));
  }

  function addIngredient() {
    setForm((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, { ...emptyIngredient }],
    }));
  }

  function removeIngredient(index: number) {
    if (form.ingredients.length <= 1) return;
    setForm((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  }

  function handleSubmit() {
    if (!form.name.trim()) return;
    const cleanIngredients = form.ingredients.filter((i) => i.name.trim());
    onSave({
      ...form,
      ingredients: cleanIngredients.length > 0 ? cleanIngredients : [{ name: 'Flour', quantity: '0', unit: 'g' }],
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-5 py-4">
            {/* Basic Info */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="recipe-name">Recipe Name *</Label>
                <Input
                  id="recipe-name"
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="e.g., Sourdough Bread"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => updateField('category', v)}>
                  <SelectTrigger className="mt-1 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="yield-amount">Yield</Label>
                  <Input
                    id="yield-amount"
                    value={form.yieldAmount}
                    onChange={(e) => updateField('yieldAmount', e.target.value)}
                    placeholder="12"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="yield-unit">Unit</Label>
                  <Select value={form.yieldUnit} onValueChange={(v) => updateField('yieldUnit', v)}>
                    <SelectTrigger className="mt-1 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['pieces', 'loaves', 'servings', 'dozen', 'slices', 'kg', 'lb'].map((u) => (
                        <SelectItem key={u} value={u}>{u}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Time & Temperature */}
            <Separator />
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="prep-time">Prep Time (min)</Label>
                <Input
                  id="prep-time"
                  type="number"
                  min="0"
                  value={form.prepTime || ''}
                  onChange={(e) => updateField('prepTime', parseInt(e.target.value) || 0)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="bake-time">Bake Time (min)</Label>
                <Input
                  id="bake-time"
                  type="number"
                  min="0"
                  value={form.bakeTime || ''}
                  onChange={(e) => updateField('bakeTime', parseInt(e.target.value) || 0)}
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-[1fr_60px] gap-2">
                <div>
                  <Label htmlFor="temperature">Temperature</Label>
                  <Input
                    id="temperature"
                    type="number"
                    min="0"
                    value={form.temperature || ''}
                    onChange={(e) => updateField('temperature', parseInt(e.target.value) || 0)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>&deg;</Label>
                  <Select value={form.temperatureUnit} onValueChange={(v) => updateField('temperatureUnit', v as 'F' | 'C')}>
                    <SelectTrigger className="mt-1 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="F">&deg;F</SelectItem>
                      <SelectItem value="C">&deg;C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Ingredients */}
            <Separator />
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-base font-semibold">Ingredients</Label>
                <Button variant="outline" size="sm" onClick={addIngredient}>
                  <Plus className="size-3 mr-1" />
                  Add
                </Button>
              </div>

              <div className="space-y-2">
                {/* Header */}
                <div className="grid grid-cols-[1fr_80px_70px_32px] gap-2 text-xs font-medium text-muted-foreground">
                  <span>Ingredient</span>
                  <span>Qty</span>
                  <span>Unit</span>
                  <span></span>
                </div>

                {form.ingredients.map((ing, i) => (
                  <div key={i} className="grid grid-cols-[1fr_80px_70px_32px] gap-2 items-center">
                    <Input
                      value={ing.name}
                      onChange={(e) => updateIngredient(i, 'name', e.target.value)}
                      placeholder="Ingredient name"
                      className="h-8 text-sm"
                    />
                    <Input
                      value={ing.quantity}
                      onChange={(e) => updateIngredient(i, 'quantity', e.target.value)}
                      placeholder="500"
                      className="h-8 text-sm"
                    />
                    <Select value={ing.unit} onValueChange={(v) => updateIngredient(i, 'unit', v)}>
                      <SelectTrigger className="h-8 text-sm w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {units.map((u) => (
                          <SelectItem key={u} value={u}>{u}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <button
                      onClick={() => removeIngredient(i)}
                      className="p-1 text-muted-foreground hover:text-red-600 disabled:opacity-30"
                      disabled={form.ingredients.length <= 1}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <Separator />
            <div>
              <Label htmlFor="instructions">Instructions</Label>
              <Textarea
                id="instructions"
                value={form.instructions}
                onChange={(e) => updateField('instructions', e.target.value)}
                placeholder="Step-by-step instructions for making this recipe..."
                rows={5}
                className="mt-1"
              />
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                placeholder="Tips, variations, or special notes..."
                rows={3}
                className="mt-1"
              />
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!form.name.trim()}>
            Save Recipe
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
