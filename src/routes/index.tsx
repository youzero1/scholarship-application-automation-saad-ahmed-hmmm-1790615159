import { createFileRoute } from '@tanstack/react-router';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { Hero } from '@/components/landing/Hero';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { FeatureCards } from '@/components/landing/FeatureCards';
import { Pricing } from '@/components/landing/Pricing';
import { EmailCapture } from '@/components/landing/EmailCapture';
import { SiteFooter } from '@/components/layout/SiteFooter';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />

        <ProblemSection />

        <FeatureCards />

        <Pricing />

        <EmailCapture />
      </main>
      <SiteFooter />
    </>
  );
}
