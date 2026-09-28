import { useEffect, type ReactNode } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';

function FullPageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-accent" />
    </div>
  );
}

/**
 * Renders children only for a signed-in user. `requireOnboarded` additionally
 * bounces users who have not finished the welcome flow to /onboarding.
 */
export function RequireAuth({
  children,
  requireOnboarded = true,
}: {
  children: ReactNode;
  requireOnboarded?: boolean;
}) {
  const { session, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!session) {
      navigate({ to: '/sign-in' });
      return;
    }
    if (requireOnboarded && profile && !profile.onboarded) {
      navigate({ to: '/onboarding' });
    }
  }, [loading, session, profile, requireOnboarded, navigate]);

  if (loading || !session) return <FullPageLoader />;
  if (requireOnboarded && profile && !profile.onboarded) return <FullPageLoader />;

  return <>{children}</>;
}

/** Signed-in users should not sit on the auth pages. */
export function RedirectIfSignedIn({ children }: { children: ReactNode }) {
  const { session, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || !session) return;
    navigate({ to: profile && !profile.onboarded ? '/onboarding' : '/app' });
  }, [loading, session, profile, navigate]);

  if (loading) return <FullPageLoader />;
  if (session) return <FullPageLoader />;

  return <>{children}</>;
}
