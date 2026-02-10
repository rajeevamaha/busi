'use client';

import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SectionWrapperProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function SectionWrapper({ title, description, children }: SectionWrapperProps) {
  return (
    <Card className="mb-3 py-4 gap-3">
      <CardHeader className="pb-1 px-4">
        <CardTitle className="text-sm">{title}</CardTitle>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent className="space-y-3 px-4">{children}</CardContent>
    </Card>
  );
}
