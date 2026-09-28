import { createFileRoute } from '@tanstack/react-router';
import { AuthForm } from '@/components/auth/AuthForm';
import { RedirectIfSignedIn } from '@/components/layout/RouteGuards';

export const Route = createFileRoute('/sign-in')({
  component: SignInPage,
});

function SignInPage() {
  return (
    <RedirectIfSignedIn>
      <main className="flex min-h-screen items-center justify-center px-6 py-16">
        <AuthForm mode="sign-in" />
      </main>
    </RedirectIfSignedIn>
  );
}
