import { createFileRoute, Link } from '@tanstack/react-router';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs tracking-wide text-muted uppercase">
        <Sparkles className="h-3.5 w-3.5 text-accent" /> ScholarSync
      </span>
      <h1 className="font-display text-5xl sm:text-6xl">Building the future</h1>
      <p className="max-w-xl text-muted">
        Automated scholarship applications with real-time status tracking. The full landing
        experience lands next — the account flow is live now.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link to="/sign-up">
          <Button size="lg">Start free</Button>
        </Link>
        <Link to="/sign-in">
          <Button size="lg" variant="outline">
            Sign in
          </Button>
        </Link>
      </div>
    </main>
  );
}
