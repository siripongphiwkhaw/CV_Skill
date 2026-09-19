import { createStore, KEYS } from '../lib/storage';
import { isCv, isProfile, isSession } from '../lib/validators';
import type { Cv } from '../types/cv';
import type { SkillProfile } from '../types/profile';
import type { JobSession } from '../types/jobFit';

export const cvStore = createStore<Cv>(KEYS.cv, isCv);
export const profileStore = createStore<SkillProfile>(KEYS.profile, isProfile);
export const sessionStore = createStore<JobSession>(KEYS.session, isSession);
