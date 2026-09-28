import { useEffect, useMemo, useRef, useState } from 'react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, ExternalLink, Loader2, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useApplications } from '@/hooks/useApplications';
import { useScholarships } from '@/hooks/useScholarships';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge, statusLabels } from '@/components/ui/badge';
import { StatusSelect } from '@/components/app/StatusSelect';
import { formatCurrency, formatDate, daysUntil } from '@/lib/utils';
import type { ApplicationStatus } from '@/types/database';

export const Route = createFileRoute('/app/applications/$applicationId')({
  component: ApplicationDetailPage,
});

function ApplicationDetailPage() {
  const { applicationId } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { applications, loading, updateApplication, setStatus, removeApplication } =
    useApplications(user?.id ?? null);
  const { scholarships } = useScholarships();

  const application = useMemo(
    () => (applications ?? []).find((a) => a.id === applicationId) ?? null,
    [applications, applicationId],
  );
  const scholarship = useMemo(
    () => (scholarships ?? []).find((s) => s.id === application?.scholarship_id) ?? null,
    [scholarships, application],
  );

  const [draft, setDraft] = useState('');
  const [notes, setNotes] = useState('');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [error, setError] = useState<string | null>(null);
  const hydrated = useRef(false);

  useEffect(() => {
    if (!application || hydrated.current) return;
    setDraft(application.draft_content ?? '');
    setNotes(application.notes ?? '');
    hydrated.current = true;
  }, [application]);

  // Autosave the draft and notes a moment after typing stops.
  useEffect(() => {
    if (!application || !hydrated.current) return;
    if (draft === (application.draft_content ?? '') && notes === (application.notes ?? '')) return;
    setSaveState('saving');
    const t = setTimeout(async () => {
      try {
        await updateApplication(application.id, { draft_content: draft, notes });
        setSaveState('saved');
      } catch (e: any) {
        setError(e.message ?? 'Autosave failed.');
        setSaveState('idle');
      }
    }, 900);
    return () => clearTimeout(t);
  }, [draft, notes, application, updateApplication]);

  async function handleStatus(next: ApplicationStatus) {
    if (!application) return;
    setError(null);
    try {
      await setStatus(application.id, next);
    } catch (e: any) {
      setError(e.message ?? 'Could not update the status.');
    }
  }

  async function handleDelete() {
    if (!application) return;
    await removeApplication(application.id);
    navigate({ to: '/app' });
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-dashed border-border p-12 text-center">
        <p className="text-sm text-muted">We could not find that application.</p>
        <Link to="/app" className="mt-4 inline-block">
          <Button variant="outline" size="sm">
            Back to dashboard
          </Button>
        </Link>
      </div>
    );
  }

  const timeline: { label: string; value: string | null }[] = [
    { label: 'Started', value: application.created_at },
    { label: 'Submitted', value: application.submitted_at },
    { label: 'Decision', value: application.decided_at },
  ];

  return (
    <div className="space-y-6">
      <Link to="/app" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-display text-3xl">{scholarship?.name ?? 'Application'}</h1>
          <p className="mt-1 text-sm text-muted">
            {scholarship
              ? `${scholarship.sponsor} · ${formatCurrency(scholarship.amount_cents)} · due ${formatDate(scholarship.deadline)} (${daysUntil(scholarship.deadline)} days)`
              : ''}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={application.status} />
          <StatusSelect value={application.status} onChange={handleStatus} />
        </div>
      </div>

      {error && (
        <p className="rounded-[var(--radius-md)] border border-status-rejected/40 bg-status-rejected/10 px-4 py-3 text-sm text-status-rejected">
          {error}
        </p>
      )}

      {scholarship && (
        <Card>
          <CardHeader>
            <CardTitle>Their prompt</CardTitle>
            <CardDescription>{scholarship.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="rounded-[var(--radius-md)] border border-border bg-surface-raised/40 p-4 text-sm leading-relaxed">
              {scholarship.prompt}
            </p>
            {scholarship.url && (
              <a
                href={scholarship.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
              >
                Open the sponsor's application page <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Your draft</CardTitle>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted">
              {saveState === 'saving' && <Loader2 className="h-3 w-3 animate-spin" />}
              {saveState === 'saving' ? 'Saving…' : saveState === 'saved' ? 'Saved' : 'Autosaves'}
            </span>
          </div>
          <CardDescription>Edit freely — every change is stored against this application.</CardDescription>
        </CardHeader>
        <CardContent>
          <label htmlFor="draft-editor" className="sr-only">
            Draft content
          </label>
          <Textarea
            id="draft-editor"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="min-h-96"
          />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
            <CardDescription>Current status: {statusLabels[application.status]}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {timeline.map((t) => (
              <div key={t.label} className="flex items-center justify-between text-sm">
                <span className="text-muted">{t.label}</span>
                <span className="font-mono text-xs">
                  {t.value ? new Date(t.value).toLocaleDateString('en-US') : '—'}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
            <CardDescription>Anything you want to remember about this one.</CardDescription>
          </CardHeader>
          <CardContent>
            <label htmlFor="notes" className="sr-only">
              Notes
            </label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Recommendation letter requested on the 4th…"
              className="min-h-32"
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={handleDelete}>
          <Trash2 className="h-4 w-4" />
          Remove from pipeline
        </Button>
      </div>
    </div>
  );
}
