'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UseFormRegister, FieldPath, FieldValues } from 'react-hook-form';

interface NumberInputProps<T extends FieldValues> {
  label: string;
  name: FieldPath<T>;
  register: UseFormRegister<T>;
  error?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}

export function NumberInput<T extends FieldValues>({
  label,
  name,
  register,
  error,
  placeholder = '0',
  min = 0,
  max,
  step = 1,
}: NumberInputProps<T>) {
  return (
    <div className="space-y-1">
      <Label htmlFor={name} className="text-xs text-muted-foreground">
        {label}
      </Label>
      <Input
        id={name}
        type="number"
        step={step}
        min={min}
        max={max}
        placeholder={placeholder}
        className="h-8"
        {...register(name, { valueAsNumber: true })}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
