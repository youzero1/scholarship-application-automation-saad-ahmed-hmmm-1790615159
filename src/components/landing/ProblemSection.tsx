import { RevealSection } from '@/components/landing/Section';

const stats = [
  {
    figure: '$3.6B',
    label: 'in aid goes unclaimed each year',
    detail: 'Not because students do not qualify — because nobody finishes the paperwork.',
  },
  {
    figure: '6 hrs',
    label: 'spent on a single application',
    detail: 'Re-typing the same background, re-writing the same essay, chasing the same details.',
  },
  {
    figure: '1 in 3',
    label: 'applications miss their deadline',
    detail: 'Tracked across email threads, sticky notes and a dozen provider portals.',
  },
];

export function ProblemSection() {
  return (
    <RevealSection className="py-20" id="problem">
      <div className="max-w-2xl">
        <p className="text-xs tracking-[0.18em] text-accent uppercase">The problem</p>
        <h2 className="mt-3 font-display text-3xl sm:text-4xl">
          The money is there. The process is what breaks students.
        </h2>
        <p className="mt-4 leading-relaxed text-muted">
          A motivated student can find fifty scholarships they qualify for and still end the year
          with nothing, because fifty applications means fifty forms, fifty prompts and fifty
          deadlines held in their head. Aid offices watch it happen every cycle and have no way to
          intervene at scale. ScholarSync removes the busywork so the only thing left is the part
          that actually matters — the student's story.
        </p>
      </div>

      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {stats.map((s) => (
          <div
            key={s.figure}
            className="rounded-[var(--radius-lg)] border border-border bg-surface/60 p-6"
          >
            <p className="font-display text-4xl text-foreground">{s.figure}</p>
            <p className="mt-2 text-sm font-medium text-accent">{s.label}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">{s.detail}</p>
          </div>
        ))}
      </div>
    </RevealSection>
  );
}
