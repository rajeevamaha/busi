'use client';

import { roles, type RoleConfig } from '@/lib/ai/roles';
import type { AgentRole } from '@/lib/ai/tools';
import { Crown, Calculator, ChefHat, ClipboardList } from 'lucide-react';

const iconMap: Record<string, typeof Crown> = {
  Crown,
  Calculator,
  ChefHat,
  ClipboardList,
};

interface RoleSelectorProps {
  selected: AgentRole;
  onSelect: (role: AgentRole) => void;
  compact?: boolean;
}

export function RoleSelector({ selected, onSelect, compact }: RoleSelectorProps) {
  const roleList = Object.values(roles);

  if (compact) {
    return (
      <div className="flex gap-1">
        {roleList.map((role) => {
          const Icon = iconMap[role.icon] || Crown;
          const isSelected = selected === role.id;
          return (
            <button
              key={role.id}
              onClick={() => onSelect(role.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                isSelected
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 hover:bg-muted text-muted-foreground'
              }`}
              title={role.description}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{role.label.split(' / ')[0]}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {roleList.map((role) => (
        <RoleCard
          key={role.id}
          role={role}
          selected={selected === role.id}
          onSelect={() => onSelect(role.id)}
        />
      ))}
    </div>
  );
}

function RoleCard({ role, selected, onSelect }: { role: RoleConfig; selected: boolean; onSelect: () => void }) {
  const Icon = iconMap[role.icon] || Crown;

  return (
    <button
      onClick={onSelect}
      className={`flex flex-col items-start gap-2 p-4 rounded-lg border-2 text-left transition-all ${
        selected
          ? 'border-primary bg-primary/5'
          : 'border-muted hover:border-primary/30'
      }`}
    >
      <div className="flex items-center gap-2">
        <Icon className={`h-5 w-5 ${selected ? 'text-primary' : 'text-muted-foreground'}`} />
        <span className="font-medium text-sm">{role.label}</span>
      </div>
      <p className="text-xs text-muted-foreground">{role.description}</p>
    </button>
  );
}
