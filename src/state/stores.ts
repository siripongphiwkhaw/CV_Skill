import { createStore, isRecord, KEYS } from '../lib/storage';
import type { Cv } from '../types/cv';
import type { SkillProfile } from '../types/profile';
import type { JobSession } from '../types/jobFit';

function isCv(v: unknown): v is Cv {
  return isRecord(v) && isRecord(v['basics']) && typeof v['summary'] === 'string'
    && Array.isArray(v['education']) && Array.isArray(v['experience'])
    && Array.isArray(v['skills']) && Array.isArray(v['extras']);
}

function isProfile(v: unknown): v is SkillProfile {
  return isRecord(v) && Array.isArray(v['skills']) && Array.isArray(v['surveyAnswers']) && typeof v['updatedAt'] === 'string';
}

function isSession(v: unknown): v is JobSession {
  return isRecord(v) && typeof v['step'] === 'number' && typeof v['jd'] === 'string'
    && Array.isArray(v['accepted']) && isRecord(v['answers']) && Array.isArray(v['changes']);
}

export const cvStore = createStore<Cv>(KEYS.cv, isCv);
export const profileStore = createStore<SkillProfile>(KEYS.profile, isProfile);
export const sessionStore = createStore<JobSession>(KEYS.session, isSession);
