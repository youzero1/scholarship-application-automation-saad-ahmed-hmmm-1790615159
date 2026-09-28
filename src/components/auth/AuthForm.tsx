import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';

function friendlyError(message: string) {
  const m = message.toLowerCase();
  if (m.includes('invalid login')) return 'That email and password combination does not match an account.';
  if (m.includes('already registered') || m.includes('already been registered'))
    return 'An account with this email already exists. Try signing in instead.';
  if (m.includes('password should be')) return 'Use a password of at least 6 characters.';
  if (m.includes('email address') && m.includes('invalid')) return 'That email address does not look right.';
  return message;
}

export function AuthForm({
  mode,
  redirectTo,
}: {
  mode: 'sign-in' | 'sign-up';
  redirectTo?: string;
}) {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState<string | null>(null);

  const isSignUp = mode === 'sign-up';

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (isSignUp) {
        const { needsEmailConfirmation } = await signUp(email.trim(), password);
        if (needsEmailConfirmation) {
          setConfirmEmail(email.trim());
          return;
        }
        navigate({ to: '/onboarding' });
      } else {
        await signIn(email.trim(), password);
        navigate({ to: redirectTo ?? '/app' });
      }
    } catch (e: any) {
      setError(friendlyError(e?.message ?? 'Something went wrong. Try again.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <Link to="/" className="mb-8 inline-flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-accent" />
        <span className="font-display text-lg tracking-tight">ScholarSync</span>
      </Link>

      {confirmEmail ? (
        <div>
          <h1 className="font-display text-3xl">Check your inbox</h1>
          <p className="mt-3 text-sm text-muted">
            We sent a confirmation link to{' '}
            <span className="text-foreground">{confirmEmail}</span>. Click it to activate your
            account, then come back and sign in — your matches will be waiting.
          </p>
          <p className="mt-3 text-sm text-muted">
            Nothing after a minute or two? Check spam, or try signing up again with a different
            address.
          </p>
          <Link to="/sign-in" className="mt-8 inline-block">
            <Button size="lg">Go to sign in</Button>
          </Link>
        </div>
      ) : (
      <>
      <h1 className="font-display text-3xl">
        {isSignUp ? 'Start applying in minutes' : 'Welcome back'}
      </h1>
      <p className="mt-2 text-sm text-muted">
        {isSignUp
          ? 'Create an account and we will match you to scholarships that fit your profile.'
          : 'Sign in to pick up your applications where you left them.'}
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@school.edu"
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete={isSignUp ? 'new-password' : 'current-password'}
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
          />
        </div>

        {error && (
          <p className="rounded-[var(--radius-md)] border border-status-rejected/40 bg-status-rejected/10 px-3 py-2 text-sm text-status-rejected">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSignUp ? 'Create account' : 'Sign in'}
        </Button>
      </form>

      <p className="mt-6 text-sm text-muted">
        {isSignUp ? 'Already have an account? ' : "Don't have an account yet? "}
        <Link
          to={isSignUp ? '/sign-in' : '/sign-up'}
          className="text-accent underline underline-offset-4"
        >
          {isSignUp ? 'Sign in' : 'Create one free'}
        </Link>
      </p>
      </>
      )}
    </div>
  );
}
