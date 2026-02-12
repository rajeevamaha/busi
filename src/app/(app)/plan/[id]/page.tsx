'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useBusinessPlanStore } from '@/stores/business-plan-store';
import { useUIStore } from '@/stores/ui-store';
import { WorkspaceLayout } from '@/components/layout/workspace-layout';
import { OnboardingLayout } from '@/components/onboarding/onboarding-layout';
import { PlanForm } from '@/components/form/plan-form';
import { DashboardPanel } from '@/components/dashboard/dashboard-panel';
import { AgentChatPanel } from '@/components/chat/agent-chat-panel';
import { RoleSelector } from '@/components/roles/role-selector';
import { PlanTabs } from '@/components/layout/plan-tabs';
import { BakersRatioPage } from '@/components/bakers-ratio/bakers-ratio-page';
import { RecipeBuilderPage } from '@/components/recipes/recipe-builder-page';
import { ResourcesPage } from '@/components/resources/resources-page';
import { defaultFormData, FormData } from '@/lib/engine/types';
import type { AgentRole } from '@/lib/ai/tools';
import { ONBOARDING_GREETING } from '@/lib/ai/prompts/onboarding';

export default function PlanPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const isOnboardingParam = searchParams.get('onboarding') === 'true';

  const loadPlan = useBusinessPlanStore((s) => s.loadPlan);
  const setRole = useBusinessPlanStore((s) => s.setRole);
  const setIsOnboarding = useBusinessPlanStore((s) => s.setIsOnboarding);
  const isOnboarding = useBusinessPlanStore((s) => s.isOnboarding);
  const role = useBusinessPlanStore((s) => s.role);
  const setLayoutMode = useUIStore((s) => s.setLayoutMode);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('planner');
  const [showRolePicker, setShowRolePicker] = useState(false);

  useEffect(() => {
    async function fetchPlan() {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      try {
        const res = await fetch(`/api/plans/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          router.push('/dashboard');
          return;
        }
        const data = await res.json();
        const formData = (data.plan.formData && Object.keys(data.plan.formData).length > 0)
          ? { ...defaultFormData, ...(data.plan.formData as FormData) }
          : defaultFormData;

        const planRole = (data.plan.role || 'ceo') as AgentRole;
        const planOnboarding = isOnboardingParam || !data.plan.onboardingComplete;

        loadPlan(data.plan.id, data.plan.name, formData, planRole, planOnboarding);

        // Show role picker for new plans entering onboarding
        if (isOnboardingParam && !data.plan.onboardingComplete) {
          setShowRolePicker(true);
          setLayoutMode('onboarding');
        }
      } catch {
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    }
    fetchPlan();
  }, [id, loadPlan, router, isOnboardingParam, setLayoutMode]);

  const handleRoleSelect = useCallback(async (newRole: AgentRole) => {
    setRole(newRole);
    setShowRolePicker(false);

    // Save role to DB
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`/api/plans/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      }).catch(console.error);
    }
  }, [id, setRole]);

  const handleExitOnboarding = useCallback(async () => {
    setIsOnboarding(false);
    setLayoutMode('standard');

    // Mark onboarding complete in DB
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`/api/plans/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ onboardingComplete: true }),
      }).catch(console.error);
    }
  }, [id, setIsOnboarding, setLayoutMode]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center">
        <p className="text-muted-foreground">Loading plan...</p>
      </div>
    );
  }

  // Role picker overlay for new plans
  if (showRolePicker) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center p-6">
        <div className="max-w-lg w-full space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">How do you see your role?</h1>
            <p className="text-muted-foreground">
              This helps us tailor the onboarding experience and dashboard to your perspective.
            </p>
          </div>
          <RoleSelector selected={role} onSelect={handleRoleSelect} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      <PlanTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 overflow-hidden">
        {activeTab === 'planner' && (
          isOnboarding ? (
            <OnboardingLayout
              chatPanel={<AgentChatPanel initialMessage={ONBOARDING_GREETING} />}
              dashboardPanel={<DashboardPanel />}
              formPanel={<PlanForm />}
              onExitOnboarding={handleExitOnboarding}
            />
          ) : (
            <WorkspaceLayout
              formPanel={<PlanForm />}
              dashboardPanel={<DashboardPanel />}
              chatPanel={<AgentChatPanel />}
            />
          )
        )}
        {activeTab === 'bakers-ratio' && <BakersRatioPage />}
        {activeTab === 'recipes' && <RecipeBuilderPage />}
        {activeTab === 'resources' && <ResourcesPage />}
      </div>
    </div>
  );
}
