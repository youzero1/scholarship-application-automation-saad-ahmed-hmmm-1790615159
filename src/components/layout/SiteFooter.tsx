import { Link } from '@tanstack/react-router';
import { Sparkles } from 'lucide-react';

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="font-display tracking-tight">ScholarSync</span>
          </div>
          <p className="mt-2 text-sm text-muted">Building the future.</p>
        </div>

        <nav className="flex flex-wrap items-center gap-5 text-sm text-muted">
          <a href="#how-it-works" className="transition-colors hover:text-foreground">
            How it works
          </a>
          <a href="#pricing" className="transition-colors hover:text-foreground">
            Pricing
          </a>
          <Link to="/sign-in" className="transition-colors hover:text-foreground">
            Sign in
          </Link>
          <Link to="/sign-up" className="text-accent transition-colors hover:text-accent-hover">
            Start free
          </Link>
        </nav>
      </div>
    </footer>
  );
}
