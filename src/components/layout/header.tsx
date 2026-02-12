'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { useBusinessPlanStore } from '@/stores/business-plan-store';
import { roles } from '@/lib/ai/roles';
import type { AgentRole } from '@/lib/ai/tools';
import { Crown, Calculator, ChefHat, ClipboardList } from 'lucide-react';

const iconMap: Record<string, typeof Crown> = {
  Crown,
  Calculator,
  ChefHat,
  ClipboardList,
};

export function Header() {
  const { user, logout } = useAuth();
  const isDirty = useBusinessPlanStore((s) => s.isDirty);
  const planId = useBusinessPlanStore((s) => s.planId);
  const role = useBusinessPlanStore((s) => s.role);
  const setRole = useBusinessPlanStore((s) => s.setRole);

  const currentRole = roles[role];
  const CurrentIcon = iconMap[currentRole?.icon] || Crown;

  function handleRoleChange(newRole: AgentRole) {
    setRole(newRole);
    // Persist to DB
    const token = localStorage.getItem('token');
    if (token && planId) {
      fetch(`/api/plans/${planId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      }).catch(console.error);
    }
  }

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="flex h-14 items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-xl font-bold text-primary">BusiBldr</span>
        </Link>

        <div className="flex items-center gap-3">
          {isDirty && (
            <span className="text-xs text-muted-foreground animate-pulse">
              Saving...
            </span>
          )}

          {planId && currentRole && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <CurrentIcon className="h-3.5 w-3.5" />
                  {currentRole.label.split(' / ')[0]}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="text-xs">Switch Role</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {Object.values(roles).map((r) => {
                  const Icon = iconMap[r.icon] || Crown;
                  return (
                    <DropdownMenuItem
                      key={r.id}
                      onClick={() => handleRoleChange(r.id)}
                      className={role === r.id ? 'bg-accent' : ''}
                    >
                      <Icon className="h-3.5 w-3.5 mr-2" />
                      {r.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  {user.email}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">My Plans</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
