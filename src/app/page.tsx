'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50 px-4">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-5xl font-bold tracking-tight">
          Busi<span className="text-primary">Bldr</span>
        </h1>
        <p className="text-xl text-muted-foreground">
          The financial planning tool for bakeries, restaurants, and food businesses.
          Get instant insights on your cost structure, benchmark against industry
          standards, and chat with an AI advisor.
        </p>

        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/signup">Get Started Free</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/login">Sign In</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 text-left">
          <div className="p-4 rounded-lg border bg-white">
            <h3 className="font-semibold mb-2">Smart Form</h3>
            <p className="text-sm text-muted-foreground">
              Fill in your business details and see calculations update in real time.
              Adaptive sections for solo operators and teams.
            </p>
          </div>
          <div className="p-4 rounded-lg border bg-white">
            <h3 className="font-semibold mb-2">Live Dashboard</h3>
            <p className="text-sm text-muted-foreground">
              Health score, P&L, cost breakdown, benchmarks, and break-even analysis
              — all updating as you type.
            </p>
          </div>
          <div className="p-4 rounded-lg border bg-white">
            <h3 className="font-semibold mb-2">AI Advisor</h3>
            <p className="text-sm text-muted-foreground">
              Claude-powered chat that understands your numbers and gives specific,
              actionable recommendations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
