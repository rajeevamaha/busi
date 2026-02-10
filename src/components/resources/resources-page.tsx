'use client';

import { Card, CardContent } from '@/components/ui/card';

export function ResourcesPage() {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-7rem)]">
      <Card className="max-w-md w-full mx-4">
        <CardContent className="p-8 text-center">
          <p className="text-4xl mb-4">🚧</p>
          <h2 className="text-xl font-bold mb-2">Coming Soon</h2>
          <p className="text-muted-foreground text-sm">
            This section will include guides, templates, and resources to help you grow your food business.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
