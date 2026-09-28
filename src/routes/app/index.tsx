import { createFileRoute } from '@tanstack/react-router';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export const Route = createFileRoute('/app/')({
  component: DashboardPage,
});

function DashboardPage() {
  const { profile } = useAuth();
  const firstName = profile?.full_name?.split(' ')[0];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl">
          {firstName ? `Welcome back, ${firstName}` : 'Your workspace'}
        </h1>
        <p className="mt-1 text-sm text-muted">
          Matched scholarships, one-click drafts and live application status — all in one place.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {['Active applications', 'In review', 'Awarded', 'Total requested'].map((label) => (
          <Card key={label}>
            <CardContent className="pt-6">
              <p className="text-xs tracking-wide text-muted uppercase">{label}</p>
              <p className="mt-2 font-display text-3xl">—</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top matches for you</CardTitle>
          <CardDescription>
            Ranked scholarship matching and draft generation arrive in the next build phase.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-[var(--radius-lg)] border border-border bg-surface-raised/50 p-5"
            >
              <div className="mb-3 h-4 w-48 rounded bg-surface-raised" />
              <div className="mb-2 h-3 w-full rounded bg-surface-raised/70" />
              <div className="h-3 w-2/3 rounded bg-surface-raised/70" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
