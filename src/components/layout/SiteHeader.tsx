import { Link } from '@tanstack/react-router';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';

export function SiteHeader() {
  const { session } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          <span className="font-display text-lg tracking-tight">ScholarSync</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-muted md:flex">
          <a href="#how-it-works" className="transition-colors hover:text-foreground">
            How it works
          </a>
          <a href="#pricing" className="transition-colors hover:text-foreground">
            Pricing
          </a>
          <a href="#partners" className="transition-colors hover:text-foreground">
            For institutions
          </a>
        </nav>

        <div className="flex items-center gap-2">
          {session ? (
            <Link to="/app">
              <Button size="sm">Open workspace</Button>
            </Link>
          ) : (
            <>
              <Link to="/sign-in" className="hidden sm:block">
                <Button size="sm" variant="ghost">
                  Sign in
                </Button>
              </Link>
              <Link to="/sign-up">
                <Button size="sm">Start free</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
