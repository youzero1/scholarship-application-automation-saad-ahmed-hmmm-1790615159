import { Link } from '@tanstack/react-router';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export function Hero() {
  const reduced = useReducedMotion();

  return (
    <section className="relative mx-auto w-full max-w-6xl px-6 pt-20 pb-24 sm:pt-28">
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 20 }}
        animate={reduced ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="max-w-3xl"
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs tracking-[0.18em] text-muted uppercase">
          <Sparkles className="h-3.5 w-3.5 text-accent" /> ScholarSync
        </span>

        <h1 className="mt-6 font-display text-5xl leading-[1.05] sm:text-7xl">
          Building the future
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          Every scholarship a student qualifies for, matched to their profile. Every application
          drafted in one click. Every submission tracked in real time, from draft to award. No
          spreadsheets, no missed deadlines, no aid left on the table.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link to="/sign-up">
            <Button size="lg">
              Start free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <a href="#how-it-works">
            <Button size="lg" variant="outline">
              See how it works
            </Button>
          </a>
        </div>

        <p className="mt-6 text-xs text-muted">
          Free to start. No card. Built for students and the aid offices behind them.
        </p>
      </motion.div>

      <motion.div
        initial={reduced ? false : { opacity: 0, y: 28 }}
        animate={reduced ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
        className="mt-16 grid gap-4 sm:grid-cols-3"
      >
        {[
          { k: '12 min', v: 'from sign-up to a submitted first application' },
          { k: 'Live', v: 'status tracking across every application' },
          { k: '1 profile', v: 'powers every draft we write for you' },
        ].map((item) => (
          <div
            key={item.k}
            className="rounded-[var(--radius-lg)] border border-border bg-surface/60 p-5"
          >
            <p className="font-display text-2xl text-accent">{item.k}</p>
            <p className="mt-1 text-sm text-muted">{item.v}</p>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
