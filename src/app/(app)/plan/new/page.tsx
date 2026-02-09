'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NewPlanPage() {
  const router = useRouter();

  useEffect(() => {
    async function createPlan() {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

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
        router.replace(`/plan/${data.plan.id}`);
      } else {
        router.push('/dashboard');
      }
    }
    createPlan();
  }, [router]);

  return (
    <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center">
      <p className="text-muted-foreground">Creating plan...</p>
    </div>
  );
}
