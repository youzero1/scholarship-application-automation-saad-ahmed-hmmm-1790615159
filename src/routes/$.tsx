import { createFileRoute, Link } from '@tanstack/react-router';
import { Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/$')({
  component: CatchAllNotFound,
});

function CatchAllNotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <Compass className="h-8 w-8 text-accent" />
      <p className="mt-6 font-mono text-xs tracking-[0.2em] text-muted uppercase">Error 404</p>
      <h1 className="mt-3 font-display text-4xl">This page is off the map</h1>
      <p className="mt-3 max-w-md text-sm text-muted">
        The link you followed does not lead anywhere in ScholarSync. Head back to your workspace
        and keep the applications moving.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link to="/app">
          <Button size="lg">Go to my workspace</Button>
        </Link>
        <Link to="/">
          <Button size="lg" variant="ghost">
            Back to home
          </Button>
        </Link>
      </div>
    </main>
  );
}
