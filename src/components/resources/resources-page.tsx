'use client';

import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface Guide {
  title: string;
  description: string;
  category: string;
  tips: string[];
}

const guides: Guide[] = [
  {
    title: 'How to Price Your Menu',
    category: 'Revenue',
    description: 'Setting the right prices is the single biggest lever for profitability. Here\'s how to think about it.',
    tips: [
      'Calculate your food cost per item first — ingredient + packaging cost per unit',
      'Target a food cost of 28-33% of selling price (e.g., $3 cost = $9-10 selling price)',
      'Factor in perceived value — customers pay for experience, not just ingredients',
      'Use charm pricing ($9.95 vs $10) for lower-priced items, round numbers ($15) for premium',
      'Review prices every 3-6 months as ingredient costs change',
      'Test price increases on 2-3 items first before doing a full menu update',
    ],
  },
  {
    title: 'Understanding Food Cost %',
    category: 'COGS',
    description: 'Food cost percentage tells you how much of every dollar goes to ingredients. It\'s the #1 metric to track.',
    tips: [
      'Food Cost % = Total Food Purchases / Total Sales x 100',
      'Healthy range: 25-35% for most food businesses',
      'Bakeries typically run 25-30%, restaurants 28-35%',
      'Track weekly, not just monthly — catch problems early',
      'High food cost? Look at portion sizes, waste, and supplier pricing first',
      'Negotiate bulk pricing with suppliers when ordering consistently',
    ],
  },
  {
    title: 'Prime Cost: The Number That Matters Most',
    category: 'Costs',
    description: 'Prime Cost = Food Cost + Labor Cost. If this exceeds 50-55% of revenue, profitability is nearly impossible.',
    tips: [
      'Prime Cost should stay under 50% of total revenue',
      'It\'s the combination that matters — low food cost can offset higher labor',
      'Track prime cost weekly to spot trends before they become problems',
      'If prime cost is high, look at both food and labor — don\'t just cut one',
      'Cross-train employees to reduce overtime and improve flexibility',
      'Batch prep during slow hours to maximize labor efficiency',
    ],
  },
  {
    title: 'When to Hire Your First Employee',
    category: 'Labor',
    description: 'Hiring too early drains cash. Hiring too late burns you out. Here\'s how to time it right.',
    tips: [
      'Hire when you\'re consistently turning away customers or can\'t fill orders',
      'Your revenue should cover the new salary AND leave you with 10%+ margin',
      'Start with part-time help before committing to full-time',
      'Calculate: (New Employee Cost / Additional Revenue They Enable) < 30%',
      'Hire for the bottleneck — production, service, or admin — not all at once',
      'Factor in training time: new employees are ~50% productive in month 1',
    ],
  },
  {
    title: 'Negotiating a Commercial Lease',
    category: 'Rent',
    description: 'Rent is usually your biggest fixed cost. A bad lease can kill a profitable business.',
    tips: [
      'Target rent at 5-15% of projected revenue (never above 20%)',
      'Negotiate 2-3 months free rent ("build-out period") for new spaces',
      'Ask for a graduated lease — lower rent in year 1, increasing later',
      'Include a break clause allowing exit after 2-3 years if business doesn\'t work',
      'Check if CAM (common area maintenance) charges are included or extra',
      'Calculate revenue per square foot — aim for $30-50+/sqft/month for restaurants',
    ],
  },
  {
    title: 'Reducing Waste & Improving Margins',
    category: 'Operations',
    description: 'Waste is a silent profit killer. Most food businesses waste 5-10% of ingredients without realizing it.',
    tips: [
      'Track waste daily — write down everything thrown away for one week',
      'Use FIFO (First In, First Out) for all perishable ingredients',
      'Prep in smaller batches more frequently rather than large batches',
      'Repurpose day-old products: bread → croutons, pastries → bread pudding',
      'Standardize recipes with exact measurements to reduce over-portioning',
      'Forecast demand based on day-of-week patterns to reduce overproduction',
    ],
  },
];

const categoryColors: Record<string, string> = {
  Revenue: 'bg-green-100 text-green-800',
  COGS: 'bg-amber-100 text-amber-800',
  Costs: 'bg-red-100 text-red-800',
  Labor: 'bg-blue-100 text-blue-800',
  Rent: 'bg-purple-100 text-purple-800',
  Operations: 'bg-orange-100 text-orange-800',
};

export function ResourcesPage() {
  return (
    <ScrollArea className="h-[calc(100vh-7rem)]">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Resources & Guides</h2>
          <p className="text-muted-foreground mt-1">
            Practical tips and frameworks to help you build a profitable food business.
          </p>
        </div>

        <div className="grid gap-5">
          {guides.map((guide) => (
            <Card key={guide.title} className="overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start gap-3 mb-3">
                  <Badge variant="outline" className={`${categoryColors[guide.category] || 'bg-gray-100 text-gray-800'} border-0 text-[10px] shrink-0 mt-0.5`}>
                    {guide.category}
                  </Badge>
                  <div>
                    <h3 className="font-semibold text-base leading-tight">{guide.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{guide.description}</p>
                  </div>
                </div>

                <div className="ml-0 mt-3 space-y-2">
                  {guide.tips.map((tip, i) => (
                    <div key={i} className="flex gap-2 text-sm">
                      <span className="text-primary font-bold shrink-0">{i + 1}.</span>
                      <span className="text-muted-foreground">{tip}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-5 text-center">
            <h3 className="font-semibold text-blue-900 mb-1">Need personalized advice?</h3>
            <p className="text-sm text-blue-700">
              Fill in your business details in the Business Plan tab and chat with the AI Advisor for recommendations tailored to your numbers.
            </p>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
