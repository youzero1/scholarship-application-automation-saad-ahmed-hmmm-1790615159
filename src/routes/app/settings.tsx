import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useApplications } from '@/hooks/useApplications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ProfileForm } from '@/components/app/ProfileForm';

export const Route = createFileRoute('/app/settings')({
  component: SettingsPage,
});

const PLAN_COPY: Record<string, { label: string; limit: number; blurb: string }> = {
  free: {
    label: 'Free',
    limit: 5,
    blurb: 'Full matching and tracking, 5 generated drafts a month.',
  },
  pro: {
    label: 'Pro',
    limit: 50,
    blurb: 'Unlimited matching, 50 drafts a month, priority generation.',
  },
  scale: {
    label: 'Scale',
    limit: 1000,
    blurb: 'Cohort seats, shared reporting and campus onboarding.',
  },
};

function SettingsPage() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { applications } = useApplications(user?.id ?? null);

  const plan = profile?.plan ?? 'free';
  const planInfo = PLAN_COPY[plan] ?? PLAN_COPY.free;

  const now = new Date();
  const draftsThisMonth = (applications ?? []).filter((a) => {
    const created = new Date(a.created_at);
    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
  }).length;

  async function handleSignOut() {
    await signOut();
    navigate({ to: '/' });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-muted">Your profile, plan and account.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            These details drive your match scores and every draft we write. The more you fill in,
            the better both get.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>Plan</CardTitle>
            <Badge className="border-accent/40 bg-accent-soft text-accent uppercase">
              {planInfo.label}
            </Badge>
          </div>
          <CardDescription>{planInfo.blurb}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted">Drafts generated this month</span>
              <span className="font-mono text-xs">
                {draftsThisMonth} / {planInfo.limit}
              </span>
            </div>
            <Progress value={(draftsThisMonth / planInfo.limit) * 100} />
          </div>

          <p className="rounded-[var(--radius-md)] border border-border bg-surface-raised/40 p-4 text-sm text-muted">
            ScholarSync is usage-based and still in beta — rates are being set alongside our first
            campus partners, so nothing is charged yet. Everyone is on {planInfo.label} until we
            turn billing on, and we will tell you before we do.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>{user?.email}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
          <p className="text-xs text-muted">
            Need your account and every application deleted? Email us and we will wipe it within a
            day — no retention games.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
