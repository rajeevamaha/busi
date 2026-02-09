'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useBusinessPlanStore } from '@/stores/business-plan-store';
import { WorkspaceLayout } from '@/components/layout/workspace-layout';
import { PlanForm } from '@/components/form/plan-form';
import { DashboardPanel } from '@/components/dashboard/dashboard-panel';
import { ChatPanel } from '@/components/chat/chat-panel';
import { defaultFormData, FormData } from '@/lib/engine/types';

export default function PlanPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const loadPlan = useBusinessPlanStore((s) => s.loadPlan);
  const [loading, setLoading] = useState(true);

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
        loadPlan(data.plan.id, data.plan.name, formData);
      } catch {
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    }
    fetchPlan();
  }, [id, loadPlan, router]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center">
        <p className="text-muted-foreground">Loading plan...</p>
      </div>
    );
  }

  return (
    <WorkspaceLayout
      formPanel={<PlanForm />}
      dashboardPanel={<DashboardPanel />}
      chatPanel={<ChatPanel />}
    />
  );
}
