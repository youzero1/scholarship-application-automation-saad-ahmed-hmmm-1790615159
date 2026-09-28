import { CalendarClock, CircleCheck, Sparkles, Wand2 } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn, daysUntil, formatCurrency, formatDate } from '@/lib/utils';
import type { MatchResult } from '@/lib/matching';
import type { Application } from '@/types/database';

function MatchRing({ score }: { score: number }) {
  return (
    <div
      className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full"
      style={{
        background: `conic-gradient(var(--color-accent) ${score * 3.6}deg, var(--color-border) 0deg)`,
      }}
      aria-label={`Match score ${score} out of 100`}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-surface">
        <span className="font-mono text-xs text-foreground">{score}</span>
      </div>
    </div>
  );
}

export function ScholarshipCard({
  match,
  application,
  onGenerate,
}: {
  match: MatchResult;
  application?: Application;
  onGenerate: () => void;
}) {
  const s = match.scholarship;
  const days = daysUntil(s.deadline);
  const urgent = days >= 0 && days <= 21;

  return (
    <article className="rounded-[var(--radius-lg)] border border-border bg-surface/60 p-5 transition-colors hover:border-accent/40">
      <div className="flex items-start gap-4">
        <MatchRing score={match.score} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-display text-lg leading-tight">{s.name}</h3>
              <p className="text-xs text-muted">{s.sponsor}</p>
            </div>
            <div className="text-right">
              <p className="font-display text-xl text-accent">{formatCurrency(s.amount_cents)}</p>
              <p
                className={cn(
                  'inline-flex items-center gap-1 font-mono text-xs text-muted',
                  urgent && 'text-status-review',
                )}
              >
                <CalendarClock className="h-3 w-3" />
                {days >= 0 ? `${days}d · ${formatDate(s.deadline)}` : 'Closed'}
              </p>
            </div>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-muted">{s.description}</p>

          {match.reasons.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {match.reasons.map((r) => (
                <li key={r}>
                  <Badge className="border-accent/30 bg-accent-soft text-accent">
                    <Sparkles className="h-3 w-3" />
                    {r}
                  </Badge>
                </li>
              ))}
            </ul>
          )}

          {match.blockers.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-2">
              {match.blockers.map((b) => (
                <li key={b}>
                  <Badge className="border-status-rejected/30 text-status-rejected">{b}</Badge>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {application ? (
              <>
                <Link to="/app/applications/$applicationId" params={{ applicationId: application.id }}>
                  <Button size="sm" variant="outline">
                    <CircleCheck className="h-4 w-4 text-status-awarded" />
                    Open application
                  </Button>
                </Link>
                <span className="text-xs text-muted">Already in your pipeline</span>
              </>
            ) : (
              <Button size="sm" onClick={onGenerate} disabled={days < 0}>
                <Wand2 className="h-4 w-4" />
                Generate application
              </Button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
