'use client';

import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { FormData } from '@/lib/engine/types';
import { SectionWrapper } from './section-wrapper';
import { NumberInput } from './number-input';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Props {
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
  setValue: (name: keyof FormData['sectionA'] extends string ? `sectionA.${keyof FormData['sectionA'] & string}` : never, value: unknown) => void;
  watch: (name: string) => unknown;
}

export function SectionA({ register, errors, setValue, watch }: Props) {
  const businessType = watch('sectionA.businessType') as string;
  const teamSize = watch('sectionA.teamSize') as string;

  return (
    <SectionWrapper title="A. Business Basics" description="Tell us about your business">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="sectionA.businessName" className="text-sm">Business Name</Label>
          <Input
            id="sectionA.businessName"
            placeholder="My Bakery"
            {...register('sectionA.businessName')}
          />
        </div>

        <div className="space-y-1">
          <Label className="text-sm">Business Type</Label>
          <Select value={businessType} onValueChange={(v) => setValue('sectionA.businessType', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bakery">Bakery</SelectItem>
              <SelectItem value="restaurant">Restaurant</SelectItem>
              <SelectItem value="cafe">Cafe</SelectItem>
              <SelectItem value="cloud_kitchen">Cloud Kitchen</SelectItem>
              <SelectItem value="food_truck">Food Truck</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-sm">Team Size</Label>
          <Select value={teamSize} onValueChange={(v) => setValue('sectionA.teamSize', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="just_me">Just me</SelectItem>
              <SelectItem value="family_2">Family (2)</SelectItem>
              <SelectItem value="small_team_3_5">Small team (3-5)</SelectItem>
              <SelectItem value="team_6_plus">Team (6+)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="sectionA.city" className="text-sm">City / Location</Label>
          <Input
            id="sectionA.city"
            placeholder="New York, NY"
            {...register('sectionA.city')}
          />
        </div>

        <NumberInput<FormData>
          label="Floor Area (sq ft)"
          name="sectionA.floorArea"
          register={register}
          error={errors.sectionA?.floorArea?.message}
        />
        <NumberInput<FormData>
          label="Seating Capacity"
          name="sectionA.seatingCapacity"
          register={register}
          error={errors.sectionA?.seatingCapacity?.message}
          placeholder="0 for takeaway"
        />
        <NumberInput<FormData>
          label="Operating Days / Month"
          name="sectionA.operatingDaysPerMonth"
          register={register}
          error={errors.sectionA?.operatingDaysPerMonth?.message}
          min={1}
          max={31}
        />
        <NumberInput<FormData>
          label="Operating Hours / Day"
          name="sectionA.operatingHoursPerDay"
          register={register}
          error={errors.sectionA?.operatingHoursPerDay?.message}
          min={1}
          max={24}
        />
      </div>
    </SectionWrapper>
  );
}
