import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { AuthProvider } from '@/lib/auth';
import { ToastProvider } from '@/components/ui/toast';

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
});

function RootLayout() {
  return (
    <AuthProvider>
      <ToastProvider>
        <div className="relative min-h-screen bg-background text-foreground">
          <div
            aria-hidden
            className="pointer-events-none fixed inset-0 -z-10"
            style={{
              background:
                'radial-gradient(60rem 40rem at 50% -10%, hsl(28 96% 56% / 0.10), transparent 70%)',
            }}
          />
          <Outlet />
        </div>
      </ToastProvider>
    </AuthProvider>
  );
}

function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <p className="font-display text-2xl">This page does not exist.</p>
      <Link to="/" className="text-sm text-accent underline underline-offset-4">
        Go to the home page
      </Link>
    </div>
  );
}
