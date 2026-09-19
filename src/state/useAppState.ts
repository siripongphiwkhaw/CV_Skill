import { useCallback, useEffect, useRef, useState } from 'react';
import type { Store } from '../lib/storage';
import { emptyCv, type Cv } from '../types/cv';
import { emptyProfile, type SkillProfile } from '../types/profile';
import { emptySession, type JobSession, type Step } from '../types/jobFit';
import { cvStore, profileStore, sessionStore } from './stores';

type RemoteField = 'cv' | 'profile' | 'session';

/**
 * Persists to localStorage immediately (fast, works offline) and to the
 * account's database row on a debounce (so the data follows the user across
 * devices). The initial value comes from the server-rendered page when the
 * user is signed in; localStorage is only a fallback/cache after that.
 */
function usePersisted<T>(
  store: Store<T>,
  fallback: () => T,
  initial: T | null,
  field: RemoteField,
): [T, (next: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => initial ?? store.load() ?? fallback());
  const skipNextRemoteSave = useRef(true);

  useEffect(() => {
    store.save(value);

    if (skipNextRemoteSave.current) {
      skipNextRemoteSave.current = false;
      return;
    }

    const timeout = setTimeout(() => {
      fetch('/api/state', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field, value }),
      }).catch(() => { /* best-effort: the local cache still has the latest value */ });
    }, 600);
    return () => clearTimeout(timeout);
  }, [store, value, field]);

  return [value, setValue];
}

export function cvHasContent(cv: Cv): boolean {
  return Boolean(cv.basics.fullName.trim()) || cv.experience.length > 0 || cv.education.length > 0 || cv.skills.length > 0;
}

/** Which step the user may jump to. Steps only unlock once the data they need exists. */
export function maxReachableStep(cv: Cv, profile: SkillProfile, session: JobSession): Step {
  if (session.analysis) return 6;
  if (profile.skills.length > 0 || cvHasContent(cv)) return 2;
  return 1;
}

export interface InitialAppData {
  cv: Cv | null;
  profile: SkillProfile | null;
  session: JobSession | null;
}

export function useAppState(initial: InitialAppData) {
  const [cv, setCv] = usePersisted<Cv>(cvStore, emptyCv, initial.cv, 'cv');
  const [profile, setProfile] = usePersisted<SkillProfile>(profileStore, emptyProfile, initial.profile, 'profile');
  const [session, setSession] = usePersisted<JobSession>(sessionStore, emptySession, initial.session, 'session');

  const patchSession = useCallback(
    (patch: Partial<JobSession> | ((prev: JobSession) => Partial<JobSession>)) =>
      setSession((prev) => ({ ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) })),
    [setSession],
  );

  const goTo = useCallback((step: Step) => {
    patchSession({ step });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [patchSession]);

  const startAnotherJob = useCallback(() => {
    setSession({ ...emptySession(), step: 2 });
    window.scrollTo({ top: 0 });
  }, [setSession]);

  return { cv, setCv, profile, setProfile, session, setSession, patchSession, goTo, startAnotherJob };
}

export type AppState = ReturnType<typeof useAppState>;
