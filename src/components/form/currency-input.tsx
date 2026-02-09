'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UseFormRegister, FieldPath, FieldValues } from 'react-hook-form';

interface CurrencyInputProps<T extends FieldValues> {
  label: string;
  name: FieldPath<T>;
  register: UseFormRegister<T>;
  error?: string;
  placeholder?: string;
}

export function CurrencyInput<T extends FieldValues>({
  label,
  name,
  register,
  error,
  placeholder = '0',
}: CurrencyInputProps<T>) {
  return (
    <div className="space-y-1">
      <Label htmlFor={name} className="text-sm">
        {label}
      </Label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
        <Input
          id={name}
          type="number"
          step="0.01"
          min="0"
          className="pl-7"
          placeholder={placeholder}
          {...register(name, { valueAsNumber: true })}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
