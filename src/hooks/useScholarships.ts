import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Scholarship } from '@/types/database';

export function useScholarships() {
  const [scholarships, setScholarships] = useState<Scholarship[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    supabase
      .from('scholarships')
      .select('*')
      .order('deadline', { ascending: true })
      .then(({ data, error: err }) => {
        if (!active) return;
        if (err) setError(err.message);
        else setScholarships((data ?? []) as Scholarship[]);
      });
    return () => {
      active = false;
    };
  }, []);

  return { scholarships, loading: scholarships === null && !error, error };
}
