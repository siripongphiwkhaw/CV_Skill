import type { Cv } from './cv';

export type Priority = 'must' | 'nice';
export type MatchStatus = 'covered' | 'partial' | 'missing';

export interface Requirement {
  requirement: string;
  /** The short skill name behind the requirement, e.g. "SQL". */
  skill: string;
  priority: Priority;
  status: MatchStatus;
  coveredIn: string | null;
  equivalent: { yourSkill: string; note: string } | null;
  learnSuggestion: string | null;
  clarifyingQuestion: string | null;
}

export interface StandardRequirement {
  requirement: string;
  priority: Priority;
  status: MatchStatus;
  note: string;
}

export interface EmphasisNote {
  section: string;
  entry: string;
  suggestion: string;
}

export interface JobFitAnalysis {
  roleTitle: string;
  requirements: Requirement[];
  standardRequirements: StandardRequirement[];
  emphasisNotes: EmphasisNote[];
  overallNotes: string;
}

export interface InterviewQuestion {
  question: string;
  kind: 'behavioral' | 'technical' | 'case';
  hintFromCv: string;
}

export interface Scenario {
  title: string;
  description: string;
  skillsUsed: string[];
}

export interface InterviewPack {
  questions: InterviewQuestion[];
  scenarios: Scenario[];
  reflectionPrompts: string[];
}

export type Step = 1 | 2 | 3 | 4 | 5 | 6;

/** Everything about the one job currently being worked on. */
export interface JobSession {
  step: Step;
  jobTitle: string;
  company: string;
  jd: string;
  analysis: JobFitAnalysis | null;
  /** Indexes into analysis.requirements the user has closed in step 4. */
  accepted: number[];
  /** Answers typed in step 4, keyed by requirement index. */
  answers: Record<string, string>;
  builtCv: Cv | null;
  changes: string[];
  interview: InterviewPack | null;
  /** Self-check answers from step 6, keyed by prompt index. */
  reflections?: Record<string, string>;
}

export function emptySession(): JobSession {
  return {
    step: 1, jobTitle: '', company: '', jd: '', analysis: null,
    accepted: [], answers: {}, builtCv: null, changes: [], interview: null, reflections: {},
  };
}
