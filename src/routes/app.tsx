import { createFileRoute, Outlet } from '@tanstack/react-router';
import { RequireAuth } from '@/components/layout/RouteGuards';
import { AppShell } from '@/components/layout/AppShell';

export const Route = createFileRoute('/app')({
  component: AppLayout,
});

function AppLayout() {
  return (
    <RequireAuth>
      <AppShell>
        <Outlet />
      </AppShell>
    </RequireAuth>
  );
}
