import { FormData } from '@/lib/engine/types';

const sectionLabels: Record<string, string> = {
  sectionA: 'Business Basics (name, type, team size, location)',
  sectionB: 'Revenue & Demand (pricing, orders, units)',
  sectionC: 'Rent & Fixed Costs',
  sectionD: 'Cost of Goods Sold (ingredients, packaging, wastage)',
  sectionE: 'Labor & Staffing',
  sectionEAlt: "Owner's Draw (solo/family)",
  sectionF: 'Marketing',
  sectionG: 'Other Operating Expenses',
  sectionH: 'Investment & Capital',
};

function getSectionCompleteness(formData: FormData): Record<string, number> {
  const result: Record<string, number> = {};

  for (const [key, section] of Object.entries(formData)) {
    const values = Object.values(section as Record<string, unknown>);
    const filled = values.filter(v => {
      if (typeof v === 'string') return v.length > 0;
      if (typeof v === 'number') return v > 0;
      if (Array.isArray(v)) return v.length > 0;
      return false;
    });
    result[key] = values.length > 0 ? Math.round((filled.length / values.length) * 100) : 0;
  }

  return result;
}

export function buildOnboardingContext(formData: FormData): string {
  const completeness = getSectionCompleteness(formData);

  const incomplete = Object.entries(completeness)
    .filter(([, pct]) => pct < 80)
    .map(([key, pct]) => `- ${sectionLabels[key] || key}: ${pct}% complete`)
    .join('\n');

  const complete = Object.entries(completeness)
    .filter(([, pct]) => pct >= 80)
    .map(([key]) => sectionLabels[key] || key)
    .join(', ');

  return `
## Section Completeness
${incomplete || 'All sections are filled!'}
${complete ? `\nCompleted: ${complete}` : ''}
`;
}

export const ONBOARDING_GREETING = "Hi! I'm your BusiBldr AI assistant. Let's set up your business plan together. What's your business name and what type of food business is it? (bakery, restaurant, cafe, cloud kitchen, or food truck)";
