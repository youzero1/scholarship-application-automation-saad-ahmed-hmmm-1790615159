import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import type { ApplicationStatus } from '@/types/database';

const statusStyles: Record<ApplicationStatus, string> = {
  draft: 'border-status-draft/40 text-status-draft bg-status-draft/10',
  submitted: 'border-status-submitted/40 text-status-submitted bg-status-submitted/10',
  under_review: 'border-status-review/40 text-status-review bg-status-review/10',
  awarded: 'border-status-awarded/40 text-status-awarded bg-status-awarded/10',
  rejected: 'border-status-rejected/40 text-status-rejected bg-status-rejected/10',
};

export const statusLabels: Record<ApplicationStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  under_review: 'Under review',
  awarded: 'Awarded',
  rejected: 'Not selected',
};

export function Badge({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted',
        className,
      )}
      {...props}
    />
  );
}

export function StatusBadge({ status, className }: { status: ApplicationStatus; className?: string }) {
  return <Badge className={cn(statusStyles[status], className)}>{statusLabels[status]}</Badge>;
}
