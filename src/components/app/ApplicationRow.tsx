import { Link } from '@tanstack/react-router';
import { ArrowUpRight } from 'lucide-react';
import { StatusSelect } from '@/components/app/StatusSelect';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Application, ApplicationStatus, Scholarship } from '@/types/database';

export function ApplicationRow({
  application,
  scholarship,
  onStatusChange,
}: {
  application: Application;
  scholarship?: Scholarship;
  onStatusChange: (next: ApplicationStatus) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius-md)] border border-border bg-surface-raised/40 p-4">
      <div className="min-w-0">
        <Link
          to="/app/applications/$applicationId"
          params={{ applicationId: application.id }}
          className="inline-flex items-center gap-1.5 font-medium hover:text-accent"
        >
          {scholarship?.name ?? 'Scholarship'}
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
        <p className="text-xs text-muted">
          {scholarship ? `${scholarship.sponsor} · ${formatCurrency(scholarship.amount_cents)}` : ''}
          {scholarship ? ` · due ${formatDate(scholarship.deadline)}` : ''}
        </p>
      </div>

      <StatusSelect value={application.status} onChange={onStatusChange} />
    </div>
  );
}
