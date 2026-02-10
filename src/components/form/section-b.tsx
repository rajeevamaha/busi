'use client';

import { useState, useEffect, useCallback } from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { FormData, MenuItem } from '@/lib/engine/types';
import { SectionWrapper } from './section-wrapper';
import { CurrencyInput } from './currency-input';
import { NumberInput } from './number-input';
import { CalculatedField } from './calculated-field';
import { useMetrics } from '@/hooks/use-calculations';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

interface Props {
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
  setValue: UseFormSetValue<FormData>;
  watch: UseFormWatch<FormData>;
}

const itemCategories = ['Appetizer', 'Entree', 'Bread', 'Cake', 'Pastry', 'Cookie', 'Beverage', 'Side', 'Dessert', 'Other'];

const emptyItem: MenuItem = { name: '', category: 'Other', price: 0, avgQtyPerOrder: 1 };

export function SectionB({ register, errors, setValue, watch }: Props) {
  const metrics = useMetrics();
  const pricingMode = watch('sectionB.pricingMode') || 'manual';
  const menuItems: MenuItem[] = watch('sectionB.menuItems') || [];

  // Local state for the item list (mirrors RHF for responsive editing)
  const [items, setItems] = useState<MenuItem[]>(menuItems.length > 0 ? menuItems : []);

  // Sync from RHF on initial load / external reset
  useEffect(() => {
    if (menuItems.length > 0 && JSON.stringify(menuItems) !== JSON.stringify(items)) {
      setItems(menuItems);
    }
    // Only on menuItems change from outside
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(menuItems)]);

  // Push items back to RHF + compute ASP/AOV
  const syncItems = useCallback((updated: MenuItem[]) => {
    setItems(updated);
    setValue('sectionB.menuItems', updated, { shouldDirty: true });

    const validItems = updated.filter((i) => i.name.trim() && i.price > 0);
    if (validItems.length > 0) {
      // ASP = simple average of item prices
      const totalPrice = validItems.reduce((sum, i) => sum + i.price, 0);
      const asp = totalPrice / validItems.length;

      // AOV = sum of (price × avgQtyPerOrder) for items with qty > 0
      const aov = validItems.reduce((sum, i) => sum + i.price * (i.avgQtyPerOrder || 0), 0);

      setValue('sectionB.avgSellingPrice', Math.round(asp * 100) / 100, { shouldDirty: true });
      setValue('sectionB.avgOrderValue', Math.round(aov * 100) / 100, { shouldDirty: true });
      setValue('sectionB.itemsListedOnMenu', validItems.length, { shouldDirty: true });
    }
  }, [setValue]);

  function addItem() {
    syncItems([...items, { ...emptyItem }]);
  }

  function removeItem(index: number) {
    syncItems(items.filter((_, i) => i !== index));
  }

  function updateItem(index: number, field: keyof MenuItem, value: string | number) {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    syncItems(updated);
  }

  function handleModeChange(mode: string) {
    setValue('sectionB.pricingMode', mode as 'manual' | 'itemized', { shouldDirty: true });
    if (mode === 'itemized' && items.length === 0) {
      syncItems([{ ...emptyItem }]);
    }
  }

  return (
    <SectionWrapper title="B. Revenue & Demand" description="Your sales and pricing">
      {/* Mode toggle */}
      <div className="mb-4">
        <Label className="text-xs text-muted-foreground mb-2 block">How would you like to enter pricing?</Label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleModeChange('manual')}
            className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
              pricingMode === 'manual'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-muted text-muted-foreground border-transparent hover:border-gray-300'
            }`}
          >
            Enter averages manually
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('itemized')}
            className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
              pricingMode === 'itemized'
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-muted text-muted-foreground border-transparent hover:border-gray-300'
            }`}
          >
            Add individual items
          </button>
        </div>
      </div>

      {pricingMode === 'manual' ? (
        /* Manual mode — existing fields */
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <CurrencyInput<FormData>
              label="Average Selling Price / Item"
              name="sectionB.avgSellingPrice"
              register={register}
              error={errors.sectionB?.avgSellingPrice?.message}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Sum of all item prices ÷ number of items. E.g. if you sell 3 items at $10, $15, $20 → ASP = $15
            </p>
          </div>
          <div>
            <CurrencyInput<FormData>
              label="Average Order Value (AOV)"
              name="sectionB.avgOrderValue"
              register={register}
              error={errors.sectionB?.avgOrderValue?.message}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              AOV = ASP × items per order. If customers buy 2 items on avg at $15 each → AOV = $30
            </p>
          </div>
        </div>
      ) : (
        /* Itemized mode — add individual menu items */
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">Menu Items</Label>
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <Plus className="size-3 mr-1" />
              Add Item
            </Button>
          </div>

          {/* Item list header */}
          <div className="grid grid-cols-[1fr_78px_58px_46px_24px] gap-1.5 text-[10px] font-medium text-muted-foreground px-0.5">
            <span>Item Name</span>
            <span>Category</span>
            <span>Price</span>
            <span>Qty</span>
            <span></span>
          </div>

          {items.map((item, i) => (
            <div key={i} className="grid grid-cols-[1fr_78px_58px_46px_24px] gap-1.5 items-center">
              <Input
                value={item.name}
                onChange={(e) => updateItem(i, 'name', e.target.value)}
                placeholder="Sourdough"
                className="h-7 text-xs px-2"
              />
              <Select value={item.category} onValueChange={(v) => updateItem(i, 'category', v)}>
                <SelectTrigger className="h-7 text-[10px] px-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {itemCategories.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={item.price || ''}
                onChange={(e) => updateItem(i, 'price', parseFloat(e.target.value) || 0)}
                placeholder="15"
                className="h-7 text-xs px-2"
              />
              <Input
                type="number"
                min="0"
                step="0.1"
                value={item.avgQtyPerOrder || ''}
                onChange={(e) => updateItem(i, 'avgQtyPerOrder', parseFloat(e.target.value) || 0)}
                placeholder="1"
                className="h-7 text-xs px-2"
              />
              <button
                type="button"
                onClick={() => removeItem(i)}
                className="p-0.5 text-muted-foreground hover:text-red-600"
              >
                <Trash2 className="size-3" />
              </button>
            </div>
          ))}

          {items.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">
              No items yet. Click &quot;Add Item&quot; to start building your menu.
            </p>
          )}

          <Separator />

          {/* Auto-calculated ASP & AOV */}
          <div className="space-y-1.5">
            <CalculatedField
              label="Avg Selling Price (auto)"
              value={formatCurrency(watch('sectionB.avgSellingPrice') || 0)}
              suffix={`${items.filter((i) => i.name.trim() && i.price > 0).length} items averaged`}
            />
            <CalculatedField
              label="Avg Order Value (auto)"
              value={formatCurrency(watch('sectionB.avgOrderValue') || 0)}
              suffix="sum of price × avg qty per order"
            />
          </div>
        </div>
      )}

      {/* Common fields for both modes */}
      <div className="grid gap-3 sm:grid-cols-2 mt-3">
        <NumberInput<FormData>
          label="Orders per Day"
          name="sectionB.ordersPerDay"
          register={register}
          error={errors.sectionB?.ordersPerDay?.message}
        />
        <NumberInput<FormData>
          label="Units Produced per Day"
          name="sectionB.unitsProducedPerDay"
          register={register}
          error={errors.sectionB?.unitsProducedPerDay?.message}
        />
        <NumberInput<FormData>
          label="Units Sold per Day"
          name="sectionB.unitsSoldPerDay"
          register={register}
          error={errors.sectionB?.unitsSoldPerDay?.message}
        />
        {pricingMode === 'manual' && (
          <NumberInput<FormData>
            label="Items Listed on Menu"
            name="sectionB.itemsListedOnMenu"
            register={register}
            error={errors.sectionB?.itemsListedOnMenu?.message}
          />
        )}
      </div>

      <div className="mt-3 space-y-2">
        <h4 className="text-xs font-medium text-muted-foreground">Historical Revenue (optional)</h4>
        <div className="grid gap-3 sm:grid-cols-2">
          <CurrencyInput<FormData>
            label="Revenue Month -1"
            name="sectionB.revenueMonthMinus1"
            register={register}
          />
          <CurrencyInput<FormData>
            label="Revenue Month -2"
            name="sectionB.revenueMonthMinus2"
            register={register}
          />
        </div>
      </div>

      <div className="mt-3 space-y-1.5">
        <CalculatedField
          label="Monthly Revenue"
          value={formatCurrency(metrics.revenue.monthlyRevenue)}
        />
        <CalculatedField
          label="Total Revenue (incl. additional)"
          value={formatCurrency(metrics.revenue.totalRevenue)}
        />
        <CalculatedField
          label="Demand Fulfillment Rate"
          value={`${metrics.revenue.demandFulfillmentRate.toFixed(1)}%`}
        />
      </div>
    </SectionWrapper>
  );
}
