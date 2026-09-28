import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { AlertTriangle } from 'lucide-react';
import { AuthProvider } from '@/lib/auth';
import { ToastProvider } from '@/components/ui/toast';

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
  errorComponent: RootErrorBoundary,
});

/** Global safety net: any uncaught render error lands here instead of a blank screen. */
function RootErrorBoundary({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : String(error ?? 'Unknown error');
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center text-foreground">
      <AlertTriangle className="h-8 w-8 text-accent" />
      <h1 className="font-display text-3xl">Something broke on our side</h1>
      <p className="max-w-md text-sm text-muted">
        We hit an unexpected error rendering this page. Your data is safe — reload to pick up where
        you left off.
      </p>
      <p className="max-w-md rounded-[var(--radius-md)] border border-border bg-surface-raised/40 px-3 py-2 font-mono text-xs break-words text-muted">
        {message}
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-[var(--radius-md)] bg-accent px-4 py-2 text-sm font-medium text-accent-foreground"
        >
          Reload the page
        </button>
        <Link to="/" className="text-sm text-accent underline underline-offset-4">
          Go to the home page
        </Link>
      </div>
    </div>
  );
}

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
