import { useMemo, useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Search } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useScholarships } from '@/hooks/useScholarships';
import { useApplications } from '@/hooks/useApplications';
import { rankScholarships } from '@/lib/matching';
import { ScholarshipCard } from '@/components/app/ScholarshipCard';
import { GenerateDraftDialog } from '@/components/app/GenerateDraftDialog';
import { Input, Select } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { daysUntil } from '@/lib/utils';
import type { Application, Scholarship } from '@/types/database';

export const Route = createFileRoute('/app/scholarships')({
  component: ScholarshipsPage,
});

type Sort = 'match' | 'deadline' | 'amount';

function ScholarshipsPage() {
  const { profile, user } = useAuth();
  const { scholarships, loading, error } = useScholarships();
  const {
    applications,
    loading: loadingApplications,
    error: applicationsError,
    upsertDraft,
  } = useApplications(user?.id ?? null);

  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<Sort>('match');
  const [hideApplied, setHideApplied] = useState(false);
  const [generating, setGenerating] = useState<Scholarship | null>(null);

  // Hold the empty state back until both queries have settled.
  const isLoading = loading || loadingApplications;

  const appByScholarship = useMemo(() => {
    const map = new Map<string, Application>();
    (applications ?? []).forEach((a) => map.set(a.scholarship_id, a));
    return map;
  }, [applications]);

  const results = useMemo(() => {
    if (!scholarships) return [];
    let list = rankScholarships(profile, scholarships);

    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((m) =>
        [m.scholarship.name, m.scholarship.sponsor, m.scholarship.description, ...(m.scholarship.major_tags ?? [])]
          .join(' ')
          .toLowerCase()
          .includes(q),
      );
    }

    if (hideApplied) {
      list = list.filter((m) => !appByScholarship.has(m.scholarship.id));
    }

    if (sort === 'deadline') {
      list = [...list].sort(
        (a, b) => daysUntil(a.scholarship.deadline) - daysUntil(b.scholarship.deadline),
      );
    } else if (sort === 'amount') {
      list = [...list].sort((a, b) => b.scholarship.amount_cents - a.scholarship.amount_cents);
    }

    return list;
  }, [scholarships, profile, query, sort, hideApplied, appByScholarship]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Scholarship catalogue</h1>
        <p className="mt-1 text-sm text-muted">
          Every opportunity we track, scored against your profile.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-60 flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
          <label htmlFor="search" className="sr-only">
            Search scholarships
          </label>
          <Input
            id="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, sponsor or field"
            className="pl-9"
          />
        </div>

        <div>
          <label htmlFor="sort" className="sr-only">
            Sort by
          </label>
          <Select id="sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="w-48">
            <option value="match">Best match</option>
            <option value="deadline">Soonest deadline</option>
            <option value="amount">Largest award</option>
          </Select>
        </div>

        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={hideApplied}
            onChange={(e) => setHideApplied(e.target.checked)}
            className="h-4 w-4 accent-[var(--color-accent)]"
          />
          Hide ones I have applied to
        </label>
      </div>

      {error && (
        <p className="rounded-[var(--radius-md)] border border-status-rejected/40 bg-status-rejected/10 px-4 py-3 text-sm text-status-rejected">
          Could not load scholarships: {error}
        </p>
      )}

      {applicationsError && (
        <p className="rounded-[var(--radius-md)] border border-status-rejected/40 bg-status-rejected/10 px-4 py-3 text-sm text-status-rejected">
          Could not load your applications: {applicationsError}
        </p>
      )}

      {isLoading && (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      )}

      {!isLoading && results.length === 0 && !error && (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-border p-12 text-center">
          <p className="text-sm text-muted">Nothing matches that search. Try a broader term.</p>
        </div>
      )}

      <div className="grid gap-4">
        {!isLoading &&
          results.map((m) => (
            <ScholarshipCard
              key={m.scholarship.id}
              match={m}
              application={appByScholarship.get(m.scholarship.id)}
              onGenerate={() => setGenerating(m.scholarship)}
            />
          ))}
      </div>

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
