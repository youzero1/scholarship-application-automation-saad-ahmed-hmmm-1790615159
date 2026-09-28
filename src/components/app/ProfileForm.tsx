import { useEffect, useState, type FormEvent } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input, Label, Select, Textarea } from '@/components/ui/input';

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME',
  'MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA',
  'RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC',
];

export function ProfileForm() {
  const { user, profile, refreshProfile } = useAuth();

  const [fullName, setFullName] = useState('');
  const [school, setSchool] = useState('');
  const [gradYear, setGradYear] = useState('');
  const [gpa, setGpa] = useState('');
  const [major, setMajor] = useState('');
  const [state, setState] = useState('');
  const [activities, setActivities] = useState('');
  const [highlights, setHighlights] = useState('');
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    setFullName(profile.full_name ?? '');
    setSchool(profile.school ?? '');
    setGradYear(profile.grad_year?.toString() ?? '');
    setGpa(profile.gpa?.toString() ?? '');
    setMajor(profile.major ?? '');
    setState(profile.state ?? '');
    setActivities(profile.activities ?? '');
    setHighlights(profile.essay_highlights ?? '');
  }, [profile]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    setSaved(false);
    setError(null);

    const { error: err } = await supabase
      .from('profiles')
      .update({
        full_name: fullName.trim() || null,
        school: school.trim() || null,
        grad_year: gradYear ? Number(gradYear) : null,
        gpa: gpa ? Number(gpa) : null,
        major: major.trim() || null,
        state: state || null,
        activities: activities.trim() || null,
        essay_highlights: highlights.trim() || null,
      })
      .eq('id', user.id);

    if (err) {
      setError(err.message);
      setBusy(false);
      return;
    }

    await refreshProfile();
    setBusy(false);
    setSaved(true);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="s_full_name">Full name</Label>
          <Input id="s_full_name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="s_school">School</Label>
          <Input id="s_school" value={school} onChange={(e) => setSchool(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="s_major">Major or field of study</Label>
          <Input id="s_major" value={major} onChange={(e) => setMajor(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="s_grad_year">Graduation year</Label>
          <Input
            id="s_grad_year"
            type="number"
            min={2024}
            max={2040}
            value={gradYear}
            onChange={(e) => setGradYear(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="s_gpa">GPA</Label>
          <Input
            id="s_gpa"
            type="number"
            step="0.01"
            min={0}
            max={5}
            value={gpa}
            onChange={(e) => setGpa(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="s_state">State</Label>
          <Select id="s_state" value={state} onChange={(e) => setState(e.target.value)}>
            <option value="">Select a state</option>
            {US_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="s_activities">Activities and work</Label>
        <Textarea
          id="s_activities"
          value={activities}
          onChange={(e) => setActivities(e.target.value)}
          placeholder="I run the robotics club, tutor algebra on Saturdays and work weekends at my family's shop."
        />
      </div>

      <div>
        <Label htmlFor="s_highlights">Essay highlights</Label>
        <Textarea
          id="s_highlights"
          value={highlights}
          onChange={(e) => setHighlights(e.target.value)}
          placeholder="The story you want every application to lean on."
        />
      </div>

      {error && <p className="text-sm text-status-rejected">{error}</p>}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={busy}>
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          Save profile
        </Button>
        {saved && (
          <span className="inline-flex items-center gap-1.5 text-sm text-status-awarded">
            <Check className="h-4 w-4" /> Saved — your matches just got sharper.
          </span>
        )}
      </div>
    </form>
  );
}
