import { useEffect, type ReactNode } from 'react';
import { useNavigate, useRouterState } from '@tanstack/react-router';
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
 *
 * A null profile is NEVER treated as onboarded: while the profile is still
 * resolving we show a loader, and if it is genuinely absent the user is sent
 * through onboarding.
 */
export function RequireAuth({
  children,
  requireOnboarded = true,
}: {
  children: ReactNode;
  requireOnboarded?: boolean;
}) {
  const { session, profile, loading, profileLoading } = useAuth();
  const navigate = useNavigate();
  const currentPath = useRouterState({
    select: (s) => s.location.pathname + s.location.searchStr,
  });

  const waitingOnProfile = requireOnboarded && !!session && profileLoading;
  const needsOnboarding = requireOnboarded && !!session && !profileLoading && !profile?.onboarded;

  useEffect(() => {
    if (loading) return;
    if (!session) {
      navigate({ to: '/sign-in', search: { redirect: currentPath } });
      return;
    }
    if (needsOnboarding) {
      navigate({ to: '/onboarding' });
    }
  }, [loading, session, needsOnboarding, navigate, currentPath]);

  if (loading || !session) return <FullPageLoader />;
  if (waitingOnProfile || needsOnboarding) return <FullPageLoader />;

  return <>{children}</>;
}

/** Signed-in users should not sit on the auth pages. */
export function RedirectIfSignedIn({
  children,
  redirectTo,
}: {
  children: ReactNode;
  redirectTo?: string;
}) {
  const { session, profile, loading, profileLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || !session || profileLoading) return;
    if (!profile?.onboarded) {
      navigate({ to: '/onboarding' });
      return;
    }
    navigate({ to: redirectTo ?? '/app' });
  }, [loading, session, profile, profileLoading, navigate, redirectTo]);

  if (loading) return <FullPageLoader />;
  if (session) return <FullPageLoader />;

  return <>{children}</>;
}
