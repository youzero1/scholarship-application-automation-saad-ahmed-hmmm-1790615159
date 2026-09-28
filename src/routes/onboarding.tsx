import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/lib/auth';
import { RequireAuth } from '@/components/layout/RouteGuards';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export const Route = createFileRoute('/onboarding')({
  component: OnboardingPage,
});

function OnboardingPage() {
  return (
    <RequireAuth requireOnboarded={false}>
      <OnboardingPlaceholder />
    </RequireAuth>
  );
}

/** The full 2-step welcome flow is built in the next phase. */
function OnboardingPlaceholder() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl items-center px-6 py-16">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Welcome to ScholarSync</CardTitle>
          <CardDescription>
            We will ask two quick questions about your goal and how you plan to use ScholarSync,
            then take you straight to your matches.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="h-4 w-40 rounded bg-surface-raised" />
            <div className="h-20 rounded-[var(--radius-md)] border border-border bg-surface-raised/60" />
            <div className="h-20 rounded-[var(--radius-md)] border border-border bg-surface-raised/60" />
          </div>
          {profile?.onboarded && (
            <Button onClick={() => navigate({ to: '/app' })}>Go to your dashboard</Button>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
