'use client';

import { useBusinessPlanStore } from '@/stores/business-plan-store';
import { isSoloOrFamily } from '@/lib/engine/types';

const sectionLabels: Record<string, string> = {
  sectionA: 'Business Basics',
  sectionB: 'Revenue & Demand',
  sectionC: 'Rent & Costs',
  sectionD: 'COGS',
  sectionE: 'Labor',
  sectionEAlt: "Owner's Draw",
  sectionF: 'Marketing',
  sectionG: 'Other Expenses',
  sectionH: 'Investment',
};

function getCompleteness(section: Record<string, unknown>): number {
  const values = Object.values(section);
  if (values.length === 0) return 0;
  const filled = values.filter(v => {
    if (typeof v === 'string') return v.length > 0;
    if (typeof v === 'number') return v > 0;
    if (Array.isArray(v)) return v.length > 0;
    return false;
  });
  return Math.round((filled.length / values.length) * 100);
}

export function SectionProgress() {
  const formData = useBusinessPlanStore((s) => s.formData);
  const solo = isSoloOrFamily(formData.sectionA.teamSize);

  const sections = Object.entries(formData)
    .filter(([key]) => {
      if (key === 'sectionE' && solo) return false;
      if (key === 'sectionEAlt' && !solo) return false;
      return true;
    })
    .map(([key, data]) => ({
      key,
      label: sectionLabels[key] || key,
      completeness: getCompleteness(data as Record<string, unknown>),
    }));

  const overall = Math.round(
    sections.reduce((sum, s) => sum + s.completeness, 0) / sections.length
  );

  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium">Plan Progress</span>
        <span className="text-muted-foreground">{overall}%</span>
      </div>
      <div className="w-full bg-muted rounded-full h-1.5">
        <div
          className="bg-primary rounded-full h-1.5 transition-all duration-500"
          style={{ width: `${overall}%` }}
        />
      </div>
      <div className="space-y-1.5">
        {sections.map((s) => (
          <div key={s.key} className="flex items-center gap-2 text-[11px]">
            <div className="w-20 text-muted-foreground truncate">{s.label}</div>
            <div className="flex-1 bg-muted rounded-full h-1">
              <div
                className={`rounded-full h-1 transition-all duration-500 ${
                  s.completeness >= 80 ? 'bg-green-500' :
                  s.completeness >= 40 ? 'bg-amber-500' :
                  'bg-muted-foreground/30'
                }`}
                style={{ width: `${s.completeness}%` }}
              />
            </div>
            <span className="w-7 text-right text-muted-foreground">{s.completeness}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
