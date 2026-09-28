import { useState, type FormEvent } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  GraduationCap,
  Loader2,
  Radar,
  Rocket,
  Sparkles,
  Target,
  Users,
  Wand2,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { RequireAuth } from '@/components/layout/RouteGuards';
import { StepCardGroup, type StepOption } from '@/components/onboarding/StepCardGroup';
import { Button } from '@/components/ui/button';
import { Input, Label, Select } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';

export const Route = createFileRoute('/onboarding')({
  component: OnboardingPage,
});

const goalOptions: StepOption[] = [
  {
    value: 'fund_first_year',
    label: 'Fund my first year',
    description: 'Get the first year covered so starting is not the hard part.',
    icon: Rocket,
  },
  {
    value: 'cover_tuition_gap',
    label: 'Cover my tuition gap',
    description: 'Close the distance between my aid package and the real bill.',
    icon: Target,
  },
  {
    value: 'graduate_debt_free',
    label: 'Graduate debt-free',
    description: 'Stack awards across every year until the loans are unnecessary.',
    icon: GraduationCap,
  },
  {
    value: 'support_my_students',
    label: 'Support my students',
    description: "I'm an advisor or aid officer helping a cohort apply at scale.",
    icon: Users,
  },
];

const useCaseOptions: StepOption[] = [
  {
    value: 'find_matches',
    label: 'Find matching scholarships',
    description: 'Show me only the awards I actually qualify for.',
    icon: Sparkles,
  },
  {
    value: 'generate_drafts',
    label: 'Generate application drafts',
    description: 'Write the first version for me so I can edit, not stare.',
    icon: Wand2,
  },
  {
    value: 'track_status',
    label: 'Track deadlines and statuses',
    description: 'Keep every submission and decision in one live pipeline.',
    icon: Radar,
  },
];

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME',
  'MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA',
  'RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC',
];

function OnboardingPage() {
  return (
    <RequireAuth requireOnboarded={false}>
      <OnboardingFlow />
    </RequireAuth>
  );
}

function OnboardingFlow() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const reduced = useReducedMotion();

  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState<string | null>(profile?.goal ?? null);
  const [useCase, setUseCase] = useState<string | null>(profile?.primary_use_case ?? null);
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [school, setSchool] = useState(profile?.school ?? '');
  const [gradYear, setGradYear] = useState(profile?.grad_year?.toString() ?? '');
  const [gpa, setGpa] = useState(profile?.gpa?.toString() ?? '');
  const [major, setMajor] = useState(profile?.major ?? '');
  const [state, setState] = useState(profile?.state ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function finish(e: FormEvent) {
    e.preventDefault();
    if (!user || !useCase || !goal) return;
    setBusy(true);
    setError(null);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        goal,
        primary_use_case: useCase,
        full_name: fullName.trim() || null,
        school: school.trim() || null,
        grad_year: gradYear ? Number(gradYear) : null,
        gpa: gpa ? Number(gpa) : null,
        major: major.trim() || null,
        state: state || null,
        onboarded: true,
      })
      .eq('id', user.id);

    if (updateError) {
      setError(updateError.message);
      setBusy(false);
      return;
    }

    await refreshProfile();
    navigate({ to: '/app' });
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-6 py-16">
      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between text-xs tracking-[0.18em] text-muted uppercase">
          <span>Step {step} of 2</span>
          <span>{step === 1 ? 'Your goal' : 'How you will use it'}</span>
        </div>
        <Progress value={step === 1 ? 50 : 100} />
      </div>

      <motion.div
        key={step}
        initial={reduced ? false : { opacity: 0, x: 16 }}
        animate={reduced ? undefined : { opacity: 1, x: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        {step === 1 ? (
          <div>
            <h1 className="font-display text-3xl sm:text-4xl">What are you aiming at?</h1>
            <p className="mt-2 text-sm text-muted">
              This shapes how we write your application drafts. You can change it any time in
              settings.
            </p>

            <div className="mt-8">
              <StepCardGroup
                name="Your goal"
                options={goalOptions}
                value={goal}
                onChange={setGoal}
              />
            </div>

            <div className="mt-10 flex justify-end">
              <Button size="lg" disabled={!goal} onClick={() => setStep(2)}>
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={finish}>
            <h1 className="font-display text-3xl sm:text-4xl">What should we do first?</h1>
            <p className="mt-2 text-sm text-muted">
              Pick the job you want ScholarSync on, then give us the basics that power matching.
            </p>

            <div className="mt-8">
              <StepCardGroup
                name="Primary use case"
                options={useCaseOptions}
                value={useCase}
                onChange={setUseCase}
              />
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="full_name">Full name</Label>
                <Input
                  id="full_name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Maya Okonkwo"
                />
              </div>
              <div>
                <Label htmlFor="school">School</Label>
                <Input
                  id="school"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  placeholder="Riverside High School"
                />
              </div>
              <div>
                <Label htmlFor="major">Major or field of study</Label>
                <Input
                  id="major"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  placeholder="Computer Science"
                />
              </div>
              <div>
                <Label htmlFor="grad_year">Graduation year</Label>
                <Input
                  id="grad_year"
                  type="number"
                  min={2024}
                  max={2040}
                  value={gradYear}
                  onChange={(e) => setGradYear(e.target.value)}
                  placeholder="2027"
                />
              </div>
              <div>
                <Label htmlFor="gpa">GPA</Label>
                <Input
                  id="gpa"
                  type="number"
                  step="0.01"
                  min={0}
                  max={5}
                  value={gpa}
                  onChange={(e) => setGpa(e.target.value)}
                  placeholder="3.60"
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Select id="state" value={state} onChange={(e) => setState(e.target.value)}>
                  <option value="">Select a state</option>
                  {US_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {error && (
              <p className="mt-6 rounded-[var(--radius-md)] border border-status-rejected/40 bg-status-rejected/10 px-3 py-2 text-sm text-status-rejected">
                {error}
              </p>
            )}

            <div className="mt-10 flex items-center justify-between">
              <Button type="button" variant="ghost" size="lg" onClick={() => setStep(1)}>
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button type="submit" size="lg" disabled={!useCase || busy}>
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                Go to my matches
              </Button>
            </div>
          </form>
        )}
      </motion.div>
    </main>
  );
}
