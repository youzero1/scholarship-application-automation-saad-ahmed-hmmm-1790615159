import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StepOption {
  value: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

export function StepCardGroup({
  options,
  value,
  onChange,
  name,
}: {
  options: StepOption[];
  value: string | null;
  onChange: (value: string) => void;
  name: string;
}) {
  return (
    <div role="radiogroup" aria-label={name} className="grid gap-3 sm:grid-cols-2">
      {options.map(({ value: v, label, description, icon: Icon }) => {
        const selected = value === v;
        return (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(v)}
            className={cn(
              'rounded-[var(--radius-lg)] border p-5 text-left transition-colors',
              selected
                ? 'border-accent bg-accent-soft'
                : 'border-border bg-surface/60 hover:border-border-strong',
            )}
          >
            <span
              className={cn(
                'inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)]',
                selected ? 'bg-accent text-accent-foreground' : 'bg-surface-raised text-accent',
              )}
            >
              <Icon className="h-5 w-5" />
            </span>
            <p className="mt-4 font-display text-base">{label}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted">{description}</p>
          </button>
        );
      })}
    </div>
  );
}
