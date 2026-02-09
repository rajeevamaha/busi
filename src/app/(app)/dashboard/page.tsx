'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Trash2 } from 'lucide-react';

interface PlanSummary {
  id: string;
  name: string;
  businessType: string;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const [plans, setPlans] = useState<PlanSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchPlans() {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch('/api/plans', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setPlans(data.plans);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchPlans();
  }, []);

  async function createPlan() {
    const token = localStorage.getItem('token');
    if (!token) return;
    const res = await fetch('/api/plans', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: 'Untitled Plan' }),
    });
    if (res.ok) {
      const data = await res.json();
      router.push(`/plan/${data.plan.id}`);
    } else {
      const data = await res.json();
      alert(data.error || 'Failed to create plan');
    }
  }

  async function deletePlan(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm('Delete this plan?')) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    await fetch(`/api/plans/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setPlans((prev) => prev.filter((p) => p.id !== id));
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Loading plans...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Business Plans</h1>
        <Button onClick={createPlan}>
          <Plus className="h-4 w-4 mr-2" />
          New Plan
        </Button>
      </div>

      {plans.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No plans yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first business plan to get started
            </p>
            <Button onClick={createPlan}>
              <Plus className="h-4 w-4 mr-2" />
              Create Plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(`/plan/${plan.id}`)}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <p className="text-sm text-muted-foreground capitalize">
                    {plan.businessType.replace(/_/g, ' ')}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => deletePlan(plan.id, e)}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Updated {new Date(plan.updatedAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
