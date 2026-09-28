import { useState, type FormEvent } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { RevealSection } from '@/components/landing/Section';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';

type State = 'idle' | 'busy' | 'done' | 'error';

export function EmailCapture() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<State>('idle');
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setState('busy');
    setMessage(null);

    const { error } = await supabase
      .from('email_leads')
      .insert({ email: email.trim().toLowerCase(), source: 'landing' });

    if (error) {
      // Unique violation — the address is already on the list, which is a success for the user.
      if (error.code === '23505') {
        setState('done');
        setMessage("You're already on the list. We'll be in touch.");
        return;
      }
      setState('error');
      setMessage('We could not save that address. Try again in a moment.');
      return;
    }

    setState('done');
    setMessage("You're on the list. Workshop invites and beta access land in your inbox first.");
  }

  return (
    <RevealSection className="py-20" id="email-capture">
      <div
        id="partners"
        className="rounded-[var(--radius-xl)] border border-border bg-surface/70 p-8 sm:p-12"
      >
        <div className="max-w-2xl">
          <p className="text-xs tracking-[0.18em] text-accent uppercase">Get early access</p>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl">
            Bring ScholarSync to your campus.
          </h2>
          <p className="mt-4 leading-relaxed text-muted">
            We run free scholarship-strategy workshops with partner schools and open beta seats to
            their students first. Leave your email — whether you are a student, an advisor or the
            aid office — and we will tell you when the next cohort opens.
          </p>
        </div>

        {state === 'done' ? (
          <div className="mt-8 inline-flex items-start gap-3 rounded-[var(--radius-md)] border border-status-awarded/40 bg-status-awarded/10 px-4 py-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-status-awarded" />
            <p className="text-sm text-foreground">{message}</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 flex w-full max-w-lg flex-col gap-3 sm:flex-row">
            <label htmlFor="lead-email" className="sr-only">
              Email address
            </label>
            <Input
              id="lead-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@school.edu"
              className="h-11 flex-1"
            />
            <Button type="submit" size="md" disabled={state === 'busy'}>
              {state === 'busy' && <Loader2 className="h-4 w-4 animate-spin" />}
              Keep me posted
            </Button>
          </form>
        )}

        {state === 'error' && message && (
          <p className="mt-3 text-sm text-status-rejected">{message}</p>
        )}
      </div>
    </RevealSection>
  );
}
