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

export function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isSignUp = mode === 'sign-up';

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (isSignUp) {
        await signUp(email.trim(), password);
        navigate({ to: '/onboarding' });
      } else {
        await signIn(email.trim(), password);
        navigate({ to: '/app' });
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
    </div>
  );
}
