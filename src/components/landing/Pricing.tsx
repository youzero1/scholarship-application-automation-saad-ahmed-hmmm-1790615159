import { Link } from '@tanstack/react-router';
import { Check } from 'lucide-react';
import { RevealSection } from '@/components/landing/Section';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const tiers = [
  {
    name: 'Free',
    price: 'Free',
    note: 'For the student getting started',
    features: [
      'Full profile matching',
      '5 application drafts a month',
      'Live status tracking',
      'Deadline countdowns',
    ],
    cta: 'Start free',
    to: '/sign-up' as const,
    featured: false,
  },
  {
    name: 'Pro',
    price: 'Usage-based',
    note: 'For students applying seriously',
    features: [
      'Unlimited matching',
      '50 application drafts a month',
      'Deadline reminders',
      'Priority draft generation',
      'Application notes and history',
    ],
    cta: 'Start free, upgrade later',
    to: '/sign-up' as const,
    featured: true,
  },
  {
    name: 'Scale',
    price: "Let's talk",
    note: 'For aid offices and districts',
    features: [
      'Seats for your whole cohort',
      'Bulk student rosters',
      'Shared reporting across advisors',
      'Onboarding workshops for your campus',
    ],
    cta: 'Talk to us',
    to: null,
    featured: false,
  },
];

export function Pricing() {
  return (
    <RevealSection className="py-20" id="pricing">
      <div className="max-w-2xl">
        <p className="text-xs tracking-[0.18em] text-accent uppercase">Pricing</p>
        <h2 className="mt-3 font-display text-3xl sm:text-4xl">Pay for what you actually use.</h2>
        <p className="mt-4 leading-relaxed text-muted">
          ScholarSync is usage-based: you are billed on the drafts you generate, not on seats you
          forgot about. Final rates are being set with our first campus partners during beta — the
          free tier stays free either way.
        </p>
      </div>

      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={cn(
              'flex flex-col rounded-[var(--radius-lg)] border border-border bg-surface/60 p-6',
              tier.featured && 'ring-2 ring-accent',
            )}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl">{tier.name}</h3>
              {tier.featured && (
                <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">
                  Most popular
                </span>
              )}
            </div>
            <p className="mt-4 font-display text-3xl">{tier.price}</p>
            <p className="mt-1 text-sm text-muted">{tier.note}</p>

            <ul className="mt-6 flex-1 space-y-2.5">
              {tier.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-muted">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-8">
              {tier.to ? (
                <Link to={tier.to} className="block">
                  <Button className="w-full" variant={tier.featured ? 'primary' : 'outline'}>
                    {tier.cta}
                  </Button>
                </Link>
              ) : (
                <a href="#email-capture" className="block">
                  <Button className="w-full" variant="outline">
                    {tier.cta}
                  </Button>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </RevealSection>
  );
}
