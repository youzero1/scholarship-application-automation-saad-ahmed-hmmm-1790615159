import { Radar, Sparkles, Wand2 } from 'lucide-react';
import { RevealSection } from '@/components/landing/Section';

const features = [
  {
    icon: Sparkles,
    title: 'Profile-matched discovery',
    body: 'Tell us your school, major, GPA and state once. We rank every scholarship in the catalogue against that profile and show you exactly why each one fits — no more scrolling lists you were never eligible for.',
  },
  {
    icon: Wand2,
    title: 'One-click application drafts',
    body: "Pick a scholarship and get a complete, personalised draft answering its actual prompt, built from your background and your goal. Edit it, own it, send it. The blank page never happens.",
  },
  {
    icon: Radar,
    title: 'Live status tracking',
    body: 'Draft, submitted, under review, awarded. Every application moves through one pipeline that updates the instant anything changes — in this tab, the next tab, and the aid office view.',
  },
];

export function FeatureCards() {
  return (
    <RevealSection className="py-20" id="how-it-works">
      <div className="max-w-2xl">
        <p className="text-xs tracking-[0.18em] text-accent uppercase">How it works</p>
        <h2 className="mt-3 font-display text-3xl sm:text-4xl">
          Three moves from profile to funded.
        </h2>
      </div>

      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {features.map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="group rounded-[var(--radius-lg)] border border-border bg-surface/60 p-6 transition-colors hover:border-accent/50"
          >
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-accent-soft">
              <Icon className="h-5 w-5 text-accent" />
            </span>
            <h3 className="mt-5 font-display text-xl">{title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">{body}</p>
          </div>
        ))}
      </div>
    </RevealSection>
  );
}
