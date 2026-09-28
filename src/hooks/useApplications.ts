import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Application, ApplicationStatus } from '@/types/database';

/**
 * Fetches the signed-in user's applications and keeps them live via Supabase
 * Realtime, so a status change in one tab appears instantly in another.
 */
export function useApplications(userId: string | null) {
  const [applications, setApplications] = useState<Application[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userId) {
      setApplications([]);
      return;
    }
    const { data, error: err } = await supabase
      .from('applications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (err) setError(err.message);
    else setApplications((data ?? []) as Application[]);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`applications:${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'applications', filter: `user_id=eq.${userId}` },
        (payload) => {
          setApplications((prev) => {
            const current = prev ?? [];
            if (payload.eventType === 'INSERT') {
              const row = payload.new as Application;
              if (current.some((a) => a.id === row.id)) return current;
              return [row, ...current];
            }
            if (payload.eventType === 'UPDATE') {
              const row = payload.new as Application;
              return current.map((a) => (a.id === row.id ? row : a));
            }
            if (payload.eventType === 'DELETE') {
              const row = payload.old as Application;
              return current.filter((a) => a.id !== row.id);
            }
            return current;
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const upsertDraft = useCallback(
    async (scholarshipId: string, draftContent: string) => {
      if (!userId) throw new Error('Not signed in');
      const { data, error: err } = await supabase
        .from('applications')
        .upsert(
          {
            user_id: userId,
            scholarship_id: scholarshipId,
            draft_content: draftContent,
            status: 'draft' as ApplicationStatus,
          },
          { onConflict: 'user_id,scholarship_id' },
        )
        .select()
        .single();
      if (err) throw err;
      const row = data as Application;
      setApplications((prev) => {
        const current = prev ?? [];
        return current.some((a) => a.id === row.id)
          ? current.map((a) => (a.id === row.id ? row : a))
          : [row, ...current];
      });
      return row;
    },
    [userId],
  );

  const updateApplication = useCallback(
    async (id: string, patch: Partial<Application>) => {
      const { data, error: err } = await supabase
        .from('applications')
        .update(patch)
        .eq('id', id)
        .select()
        .single();
      if (err) throw err;
      const row = data as Application;
      setApplications((prev) => (prev ?? []).map((a) => (a.id === row.id ? row : a)));
      return row;
    },
    [],
  );

  const setStatus = useCallback(
    async (id: string, status: ApplicationStatus) => {
      const nowIso = new Date().toISOString();
      const patch: Partial<Application> = { status };
      if (status === 'submitted') patch.submitted_at = nowIso;
      if (status === 'awarded' || status === 'rejected') patch.decided_at = nowIso;
      return updateApplication(id, patch);
    },
    [updateApplication],
  );

  const removeApplication = useCallback(async (id: string) => {
    const { error: err } = await supabase.from('applications').delete().eq('id', id);
    if (err) throw err;
    setApplications((prev) => (prev ?? []).filter((a) => a.id !== id));
  }, []);

  return {
    applications,
    loading: applications === null && !error,
    error,
    reload: load,
    upsertDraft,
    updateApplication,
    setStatus,
    removeApplication,
  };
}
