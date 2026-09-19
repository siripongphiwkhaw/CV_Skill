import { isRecord } from './storage';
import type { Cv } from '../types/cv';
import type { SkillProfile } from '../types/profile';
import type { JobSession } from '../types/jobFit';

export function isCv(v: unknown): v is Cv {
  return isRecord(v) && isRecord(v['basics']) && typeof v['summary'] === 'string'
    && Array.isArray(v['education']) && Array.isArray(v['experience'])
    && Array.isArray(v['skills']) && Array.isArray(v['extras']);
}

export function isProfile(v: unknown): v is SkillProfile {
  return isRecord(v) && Array.isArray(v['skills']) && Array.isArray(v['surveyAnswers']) && typeof v['updatedAt'] === 'string';
}

export function isSession(v: unknown): v is JobSession {
  return isRecord(v) && typeof v['step'] === 'number' && typeof v['jd'] === 'string'
    && Array.isArray(v['accepted']) && isRecord(v['answers']) && Array.isArray(v['changes']);
}
