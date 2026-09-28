import { useEffect, useState } from 'react';
import { Loader2, Wand2 } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { generateDraft } from '@/lib/generateDraft';
import { formatCurrency } from '@/lib/utils';
import type { Profile, Scholarship } from '@/types/database';

export function GenerateDraftDialog({
  scholarship,
  profile,
  onClose,
  onSave,
}: {
  scholarship: Scholarship | null;
  profile: Profile | null;
  onClose: () => void;
  onSave: (scholarshipId: string, content: string) => Promise<void>;
}) {
  const [phase, setPhase] = useState<'writing' | 'ready' | 'saving'>('writing');
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!scholarship) return;
    setPhase('writing');
    setError(null);
    const draft = generateDraft(profile, scholarship);
    // Brief, honest pause so the user sees the generation happen rather than a flash.
    const t = setTimeout(() => {
      setContent(draft.content);
      setPhase('ready');
    }, 650);
    return () => clearTimeout(t);
  }, [scholarship, profile]);

  async function handleSave() {
    if (!scholarship) return;
    setPhase('saving');
    setError(null);
    try {
      await onSave(scholarship.id, content);
      onClose();
    } catch (e: any) {
      setError(e.message ?? 'Could not save this draft.');
      setPhase('ready');
    }
  }

  const words = content.split(/\s+/).filter(Boolean).length;

  return (
    <Dialog
      open={scholarship !== null}
      onClose={onClose}
      title={scholarship ? `Draft for ${scholarship.name}` : undefined}
      description={
        scholarship
          ? `${scholarship.sponsor} · ${formatCurrency(scholarship.amount_cents)}`
          : undefined
      }
    >
      {scholarship && (
        <div className="space-y-5">
          <div className="rounded-[var(--radius-md)] border border-border bg-surface-raised/50 p-4">
            <p className="text-xs tracking-wide text-muted uppercase">Their prompt</p>
            <p className="mt-2 text-sm leading-relaxed">{scholarship.prompt}</p>
          </div>

          {phase === 'writing' ? (
            <div className="space-y-3 py-6">
              <p className="inline-flex items-center gap-2 text-sm text-muted">
                <Loader2 className="h-4 w-4 animate-spin text-accent" />
                Writing from your profile, goal and their prompt…
              </p>
              <Progress value={70} />
            </div>
          ) : (
            <>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label htmlFor="draft" className="text-xs tracking-wide text-muted uppercase">
                    Your draft
                  </label>
                  <span className="font-mono text-xs text-muted">{words} words</span>
                </div>
                <Textarea
                  id="draft"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-72"
                />
              </div>

              {error && <p className="text-sm text-status-rejected">{error}</p>}

              <div className="flex items-center justify-end gap-3">
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={phase === 'saving' || !content.trim()}>
                  {phase === 'saving' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="h-4 w-4" />
                  )}
                  Save to my pipeline
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </Dialog>
  );
}
