import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types/database';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  /** True while a profile row is being fetched for the current session. */
  profileLoading: boolean;
  signUp: (email: string, password: string) => Promise<{ needsEmailConfirmation: boolean }>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<Profile | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Loads the profile row. Immediately after sign-up the row is created by the
 * handle_new_user trigger, which can land a beat after the auth call returns —
 * so retry a few times with a short backoff before giving up.
 */
async function fetchProfile(userId: string, retries = 4): Promise<Profile | null> {
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Failed to load profile', error.message);
      return null;
    }
    if (data) return data as Profile;
    if (attempt < retries) await sleep(250 * (attempt + 1));
  }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setSession(data.session);
      userIdRef.current = data.session?.user.id ?? null;
      if (data.session?.user) {
        setProfileLoading(true);
        const p = await fetchProfile(data.session.user.id);
        if (active) setProfile(p);
      }
      if (active) {
        setProfileLoading(false);
        setLoading(false);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      const nextId = newSession?.user.id ?? null;
      if (nextId !== userIdRef.current) {
        userIdRef.current = nextId;
        if (nextId) {
          setProfileLoading(true);
          fetchProfile(nextId).then((p) => {
            setProfile(p);
            setProfileLoading(false);
          });
        } else {
          setProfile(null);
          setProfileLoading(false);
        }
      }
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = useCallback(async () => {
    const id = userIdRef.current;
    if (!id) return null;
    setProfileLoading(true);
    const p = await fetchProfile(id);
    setProfile(p);
    setProfileLoading(false);
    return p;
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    // No session means the project requires email confirmation before sign-in.
    if (!data.session) return { needsEmailConfirmation: true };
    if (data.user) {
      // The DB trigger creates the profile row; retry briefly until it exists.
      setProfileLoading(true);
      const p = await fetchProfile(data.user.id);
      setProfile(p);
      setProfileLoading(false);
    }
    return { needsEmailConfirmation: false };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.user) {
      setProfileLoading(true);
      const p = await fetchProfile(data.user.id);
      setProfile(p);
      setProfileLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setProfileLoading(false);
    setSession(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      loading,
      profileLoading,
      signUp,
      signIn,
      signOut,
      refreshProfile,
    }),
    [session, profile, loading, profileLoading, signUp, signIn, signOut, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
