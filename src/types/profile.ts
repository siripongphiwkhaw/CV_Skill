export const SKILL_CATEGORIES = ['technical', 'tool', 'domain', 'soft', 'language', 'certification'] as const;
export type SkillCategory = (typeof SKILL_CATEGORIES)[number];

export type SkillLevel = 1 | 2 | 3 | 4 | 5;

export interface SkillEntry {
  id: string;
  name: string;
  category: SkillCategory;
  level: SkillLevel | null;
  years: number | null;
  /** Verbatim quote from the CV that shows the skill, or null when it was only listed. */
  evidence: string | null;
  source: 'cv' | 'survey' | 'manual';
}

export interface SurveyAnswer {
  question: string;
  answer: string;
}

export interface SkillProfile {
  skills: SkillEntry[];
  surveyAnswers: SurveyAnswer[];
  updatedAt: string;
}

export function emptyProfile(): SkillProfile {
  return { skills: [], surveyAnswers: [], updatedAt: new Date(0).toISOString() };
}
