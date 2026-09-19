import { useCallback, useEffect, useState } from 'react';
import type { Store } from '../lib/storage';
import { emptyCv, type Cv } from '../types/cv';
import { emptyProfile, type SkillProfile } from '../types/profile';
import { emptySession, type JobSession, type Step } from '../types/jobFit';
import { cvStore, profileStore, sessionStore } from './stores';

function usePersisted<T>(store: Store<T>, fallback: () => T): [T, (next: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => store.load() ?? fallback());
  useEffect(() => { store.save(value); }, [store, value]);
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

export function useAppState() {
  const [cv, setCv] = usePersisted<Cv>(cvStore, emptyCv);
  const [profile, setProfile] = usePersisted<SkillProfile>(profileStore, emptyProfile);
  const [session, setSession] = usePersisted<JobSession>(sessionStore, emptySession);

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
