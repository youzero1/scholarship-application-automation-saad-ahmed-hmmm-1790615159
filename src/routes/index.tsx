import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <p className="font-display text-3xl text-muted">ScholarSync — landing coming up</p>
    </div>
  );
}
