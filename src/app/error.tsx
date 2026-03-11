"use client";

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global app error:', error);
  }, [error]);

  return (
    <html>
      <body className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md w-full rounded-3xl border bg-card p-8 text-center space-y-4">
          <h2 className="text-2xl font-black text-primary">Something went wrong</h2>
          <p className="text-sm text-muted-foreground">Please try again. If this keeps happening, refresh the app.</p>
          <Button className="rounded-2xl px-6" onClick={reset}>Try again</Button>
        </div>
      </body>
    </html>
  );
}
