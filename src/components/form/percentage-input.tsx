'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UseFormRegister, FieldPath, FieldValues } from 'react-hook-form';

interface PercentageInputProps<T extends FieldValues> {
  label: string;
  name: FieldPath<T>;
  register: UseFormRegister<T>;
  error?: string;
  placeholder?: string;
}

export function PercentageInput<T extends FieldValues>({
  label,
  name,
  register,
  error,
  placeholder = '0',
}: PercentageInputProps<T>) {
  return (
    <div className="space-y-1">
      <Label htmlFor={name} className="text-sm">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={name}
          type="number"
          step="0.1"
          min="0"
          max="100"
          className="pr-7"
          placeholder={placeholder}
          {...register(name, { valueAsNumber: true })}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
