'use client';

import { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useBusinessPlanStore } from '@/stores/business-plan-store';
import { useFormData } from '@/hooks/use-calculations';
import { isSoloOrFamily, ScenarioOverrides } from '@/lib/engine/types';

export function ScenarioSliders() {
  const setScenarioOverrides = useBusinessPlanStore((s) => s.setScenarioOverrides);
  const clearScenario = useBusinessPlanStore((s) => s.clearScenario);
  const scenarioMetrics = useBusinessPlanStore((s) => s.scenarioMetrics);
  const formData = useFormData();
  const solo = isSoloOrFamily(formData.sectionA.teamSize);

  const [overrides, setOverrides] = useState<ScenarioOverrides>({
    priceChange: 0,
    volumeChange: 0,
    cogsChange: 0,
    laborChange: 0,
    rentChange: 0,
  });

  function handleChange(key: keyof ScenarioOverrides, value: number) {
    const newOverrides = { ...overrides, [key]: value };
    setOverrides(newOverrides);
    setScenarioOverrides(newOverrides);
  }

  function handleReset() {
    setOverrides({ priceChange: 0, volumeChange: 0, cogsChange: 0, laborChange: 0, rentChange: 0 });
    clearScenario();
  }

  const sliders: { key: keyof ScenarioOverrides; label: string; min: number; max: number; unit: string; hidden?: boolean }[] = [
    { key: 'priceChange', label: 'Price', min: -30, max: 30, unit: '%' },
    { key: 'volumeChange', label: 'Volume', min: -30, max: 50, unit: '%' },
    { key: 'cogsChange', label: 'COGS', min: -30, max: 30, unit: '%' },
    ...(!solo ? [{ key: 'laborChange' as const, label: 'Labor Cost', min: -30, max: 30, unit: '%' }] : []),
    { key: 'rentChange', label: 'Rent', min: -2000, max: 2000, unit: '$' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">What-If Scenarios</h3>
        {scenarioMetrics && (
          <Button variant="ghost" size="sm" onClick={handleReset}>
            Reset
          </Button>
        )}
      </div>

      {sliders.map((s) => (
        <div key={s.key} className="space-y-1">
          <div className="flex justify-between">
            <Label className="text-xs">{s.label}</Label>
            <span className="text-xs font-medium tabular-nums">
              {s.unit === '$' ? (overrides[s.key] ?? 0 >= 0 ? '+' : '') : (overrides[s.key] ?? 0 >= 0 ? '+' : '')}
              {s.unit === '$' ? `$${overrides[s.key] ?? 0}` : `${overrides[s.key] ?? 0}%`}
            </span>
          </div>
          <Slider
            min={s.min}
            max={s.max}
            step={s.unit === '$' ? 100 : 1}
            value={[overrides[s.key] ?? 0]}
            onValueChange={([v]) => handleChange(s.key, v)}
          />
        </div>
      ))}
    </div>
  );
}
