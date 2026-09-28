import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Scholarship } from '@/types/database';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate, daysUntil } from '@/lib/utils';

export const Route = createFileRoute('/app/scholarships')({
  component: ScholarshipsPage,
});

function ScholarshipsPage() {
  const [items, setItems] = useState<Scholarship[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    supabase
      .from('scholarships')
      .select('*')
      .order('deadline', { ascending: true })
      .then(({ data, error }) => {
        if (!active) return;
        if (error) setError(error.message);
        else setItems((data ?? []) as Scholarship[]);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Scholarship catalogue</h1>
        <p className="mt-1 text-sm text-muted">
          Every opportunity we track, sorted by the deadline coming up soonest.
        </p>
      </div>

      {error && (
        <p className="rounded-[var(--radius-md)] border border-status-rejected/40 bg-status-rejected/10 px-4 py-3 text-sm text-status-rejected">
          Could not load scholarships: {error}
        </p>
      )}

      {!items && !error && (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      )}

      {items && items.length === 0 && (
        <p className="text-sm text-muted">No scholarships in the catalogue yet.</p>
      )}

      <div className="grid gap-4">
        {items?.map((s) => {
          const days = daysUntil(s.deadline);
          return (
            <Card key={s.id}>
              <CardContent className="pt-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="font-display text-lg">{s.name}</h2>
                    <p className="text-xs text-muted">{s.sponsor}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-xl text-accent">
                      {formatCurrency(s.amount_cents)}
                    </p>
                    <p className="font-mono text-xs text-muted">{formatDate(s.deadline)}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted">{s.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge className={days <= 30 ? 'border-status-review/40 text-status-review' : ''}>
                    {days >= 0 ? `${days} days left` : 'Closed'}
                  </Badge>
                  {s.min_gpa && <Badge>Min GPA {s.min_gpa}</Badge>}
                  {s.major_tags?.slice(0, 3).map((t) => (
                    <Badge key={t}>{t}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
