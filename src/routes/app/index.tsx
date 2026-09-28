import { useMemo, useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { CalendarClock, Inbox } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useScholarships } from '@/hooks/useScholarships';
import { useApplications } from '@/hooks/useApplications';
import { rankScholarships } from '@/lib/matching';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge, statusLabels } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScholarshipCard } from '@/components/app/ScholarshipCard';
import { ApplicationRow } from '@/components/app/ApplicationRow';
import { GenerateDraftDialog } from '@/components/app/GenerateDraftDialog';
import { daysUntil, formatCurrency, formatDate } from '@/lib/utils';
import type { ApplicationStatus, Scholarship } from '@/types/database';

export const Route = createFileRoute('/app/')({
  component: DashboardPage,
});

const pipelineOrder: ApplicationStatus[] = [
  'draft',
  'submitted',
  'under_review',
  'awarded',
  'rejected',
];

function DashboardPage() {
  const { profile, user } = useAuth();
  const { scholarships, loading: loadingScholarships, error: scholarshipsError } = useScholarships();
  const {
    applications,
    loading: loadingApplications,
    error: applicationsError,
    upsertDraft,
    setStatus,
  } = useApplications(user?.id ?? null);

  const [generating, setGenerating] = useState<Scholarship | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  const byId = useMemo(() => {
    const map = new Map<string, Scholarship>();
    (scholarships ?? []).forEach((s) => map.set(s.id, s));
    return map;
  }, [scholarships]);

  const appByScholarship = useMemo(() => {
    const map = new Map<string, (typeof applications extends null ? never : any)>();
    (applications ?? []).forEach((a) => map.set(a.scholarship_id, a));
    return map;
  }, [applications]);

  const matches = useMemo(() => {
    if (!scholarships) return [];
    return rankScholarships(profile, scholarships).filter(
      (m) => daysUntil(m.scholarship.deadline) >= 0,
    );
  }, [scholarships, profile]);

  const topMatches = matches.filter((m) => !appByScholarship.has(m.scholarship.id)).slice(0, 4);

  const stats = useMemo(() => {
    const list = applications ?? [];
    const active = list.filter((a) => a.status === 'draft' || a.status === 'submitted').length;
    const inReview = list.filter((a) => a.status === 'under_review').length;
    const awarded = list.filter((a) => a.status === 'awarded');
    const requested = list.reduce(
      (sum, a) => sum + (byId.get(a.scholarship_id)?.amount_cents ?? 0),
      0,
    );
    const won = awarded.reduce(
      (sum, a) => sum + (byId.get(a.scholarship_id)?.amount_cents ?? 0),
      0,
    );
    return { active, inReview, awarded: awarded.length, requested, won };
  }, [applications, byId]);

  const upcoming = useMemo(() => {
    return (applications ?? [])
      .map((a) => ({ application: a, scholarship: byId.get(a.scholarship_id) }))
      .filter(
        (x): x is { application: (typeof x)['application']; scholarship: Scholarship } =>
          !!x.scholarship && daysUntil(x.scholarship.deadline) >= 0,
      )
      .filter((x) => x.application.status === 'draft')
      .sort((a, b) => daysUntil(a.scholarship.deadline) - daysUntil(b.scholarship.deadline))
      .slice(0, 4);
  }, [applications, byId]);

  const firstName = profile?.full_name?.split(' ')[0];

  async function handleStatus(id: string, next: ApplicationStatus) {
    setStatusError(null);
    try {
      await setStatus(id, next);
    } catch (e: any) {
      setStatusError(e.message ?? 'Could not update that status.');
    }
  }

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
        {[
          { label: 'Active applications', value: String(stats.active) },
          { label: 'In review', value: String(stats.inReview) },
          { label: 'Awarded', value: String(stats.awarded) },
          { label: 'Total requested', value: formatCurrency(stats.requested) },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-6">
              <p className="text-xs tracking-wide text-muted uppercase">{s.label}</p>
              <p className="mt-2 font-display text-3xl">
                {loadingApplications ? <Skeleton className="h-8 w-16" /> : s.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {(scholarshipsError || applicationsError || statusError) && (
        <p className="rounded-[var(--radius-md)] border border-status-rejected/40 bg-status-rejected/10 px-4 py-3 text-sm text-status-rejected">
          {scholarshipsError || applicationsError || statusError}
        </p>
      )}

      {upcoming.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Drafts waiting on you</CardTitle>
            <CardDescription>Closest deadlines first. Submit before the clock runs out.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {upcoming.map(({ application, scholarship }) => (
              <Link
                key={application.id}
                to="/app/applications/$applicationId"
                params={{ applicationId: application.id }}
                className="rounded-[var(--radius-md)] border border-border bg-surface-raised/40 p-4 transition-colors hover:border-accent/50"
              >
                <p className="font-medium">{scholarship.name}</p>
                <p className="mt-1 inline-flex items-center gap-1.5 font-mono text-xs text-status-review">
                  <CalendarClock className="h-3 w-3" />
                  {daysUntil(scholarship.deadline)} days · {formatDate(scholarship.deadline)}
                </p>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl">Top matches for you</h2>
            <p className="mt-1 text-sm text-muted">
              Ranked against your profile. Generate a personalised draft in one click.
            </p>
          </div>
          <Link to="/app/scholarships">
            <Button variant="ghost" size="sm">
              See all
            </Button>
          </Link>
        </div>

        {loadingScholarships ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        ) : topMatches.length === 0 ? (
          <div className="rounded-[var(--radius-lg)] border border-dashed border-border p-10 text-center">
            <Inbox className="mx-auto h-6 w-6 text-muted" />
            <p className="mt-3 text-sm text-muted">
              You have started an application for every open match. Nice work.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {topMatches.map((m) => (
              <ScholarshipCard
                key={m.scholarship.id}
                match={m}
                application={appByScholarship.get(m.scholarship.id)}
                onGenerate={() => setGenerating(m.scholarship)}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-display text-2xl">Your pipeline</h2>
        <p className="mt-1 text-sm text-muted">
          Status updates land here live — including from another tab or device.
        </p>

        {loadingApplications ? (
          <div className="mt-4 space-y-3">
            {[0, 1].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : (applications ?? []).length === 0 ? (
          <div className="mt-4 rounded-[var(--radius-lg)] border border-dashed border-border p-10 text-center">
            <p className="text-sm text-muted">
              Nothing in the pipeline yet. Generate your first draft from a match above.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-6">
            {pipelineOrder.map((status) => {
              const rows = (applications ?? []).filter((a) => a.status === status);
              if (rows.length === 0) return null;
              return (
                <div key={status}>
                  <div className="mb-3 flex items-center gap-3">
                    <StatusBadge status={status} />
                    <span className="text-xs text-muted">
                      {rows.length} {rows.length === 1 ? 'application' : 'applications'}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {rows.map((a) => (
                      <ApplicationRow
                        key={a.id}
                        application={a}
                        scholarship={byId.get(a.scholarship_id)}
                        onStatusChange={(next) => handleStatus(a.id, next)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {stats.won > 0 && (
        <p className="text-sm text-status-awarded">
          {formatCurrency(stats.won)} awarded so far across {stats.awarded}{' '}
          {stats.awarded === 1 ? statusLabels.awarded.toLowerCase() : 'awards'}.
        </p>
      )}

      <GenerateDraftDialog
        scholarship={generating}
        profile={profile}
        onClose={() => setGenerating(null)}
        onSave={async (scholarshipId, content) => {
          await upsertDraft(scholarshipId, content);
        }}
      />
    </div>
  );
}
