import { Select } from '@/components/ui/input';
import { statusLabels } from '@/components/ui/badge';
import type { ApplicationStatus } from '@/types/database';

const order: ApplicationStatus[] = ['draft', 'submitted', 'under_review', 'awarded', 'rejected'];

export function StatusSelect({
  value,
  onChange,
  disabled,
}: {
  value: ApplicationStatus;
  onChange: (next: ApplicationStatus) => void;
  disabled?: boolean;
}) {
  return (
    <>
      <label className="sr-only" htmlFor={`status-${value}`}>
        Application status
      </label>
      <Select
        id={`status-${value}`}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as ApplicationStatus)}
        className="h-9 w-44 py-0 text-xs"
      >
        {order.map((s) => (
          <option key={s} value={s}>
            {statusLabels[s]}
          </option>
        ))}
      </Select>
    </>
  );
}
