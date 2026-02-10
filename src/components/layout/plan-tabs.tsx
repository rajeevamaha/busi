'use client';

import { cn } from '@/lib/utils';

interface PlanTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'planner', label: 'Business Plan' },
  { id: 'bakers-ratio', label: "Baker's Ratio" },
  { id: 'resources', label: 'Resources' },
];

export function PlanTabs({ activeTab, onTabChange }: PlanTabsProps) {
  return (
    <div className="border-b bg-white">
      <div className="flex gap-0 px-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
