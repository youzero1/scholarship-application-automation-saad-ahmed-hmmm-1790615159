import { createFileRoute } from '@tanstack/react-router';
import { AuthForm } from '@/components/auth/AuthForm';
import { RedirectIfSignedIn } from '@/components/layout/RouteGuards';

type SignInSearch = { redirect?: string };

export const Route = createFileRoute('/sign-in')({
  validateSearch: (search: Record<string, unknown>): SignInSearch => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
  }),
  component: SignInPage,
});

function SignInPage() {
  const { redirect } = Route.useSearch();
  // Only ever honour in-app paths, never an external URL.
  const safeRedirect =
    redirect && redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : undefined;

  return (
    <RedirectIfSignedIn redirectTo={safeRedirect}>
      <main className="flex min-h-screen items-center justify-center px-6 py-16">
        <AuthForm mode="sign-in" redirectTo={safeRedirect} />
      </main>
    </RedirectIfSignedIn>
  );
}
