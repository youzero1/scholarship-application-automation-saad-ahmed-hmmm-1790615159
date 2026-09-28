import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const Route = createFileRoute('/app/settings')({
  component: SettingsPage,
});

function SettingsPage() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

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
            The details we use to match you and write your drafts. The editable form arrives with
            the onboarding phase.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {[
            ['Name', profile?.full_name],
            ['School', profile?.school],
            ['Major', profile?.major],
            ['Graduation year', profile?.grad_year?.toString()],
            ['GPA', profile?.gpa?.toString()],
            ['State', profile?.state],
          ].map(([label, value]) => (
            <div key={label as string} className="rounded-[var(--radius-md)] border border-border p-3">
              <p className="text-xs tracking-wide text-muted uppercase">{label}</p>
              <p className="mt-1 text-sm">{value || 'Not set yet'}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Plan</CardTitle>
          <CardDescription>Usage-based pricing. Final rates are set during beta.</CardDescription>
        </CardHeader>
        <CardContent>
          <Badge className="border-accent/40 bg-accent-soft text-accent uppercase">
            {profile?.plan ?? 'free'}
          </Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>{user?.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={handleSignOut}>
            Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
