import { z } from 'zod/v4';
import type { SkillEntry } from '../types/profile';
import { buildPrompt, LANGUAGE_RULE, NO_FABRICATION_RULE, type Exchange } from './shared';

const PrioritySchema = z.enum(['must', 'nice']);
const StatusSchema = z.enum(['covered', 'partial', 'missing']);

export const JobFitReplySchema = z.object({
  roleTitle: z.string(),
  requirements: z.array(z.object({
    requirement: z.string(),
    skill: z.string(),
    priority: PrioritySchema,
    status: StatusSchema,
    coveredIn: z.string().nullable(),
    equivalent: z.object({ yourSkill: z.string(), note: z.string() }).nullable(),
    learnSuggestion: z.string().nullable(),
    clarifyingQuestion: z.string().nullable(),
  })).max(20),
  standardRequirements: z.array(z.object({
    requirement: z.string(),
    priority: PrioritySchema,
    status: StatusSchema,
    note: z.string(),
  })).max(10),
  emphasisNotes: z.array(z.object({ section: z.string(), entry: z.string(), suggestion: z.string() })).max(12),
  overallNotes: z.string(),
});
export type JobFitReply = z.infer<typeof JobFitReplySchema>;

export interface JobFitInput {
  cvText: string;
  skills: SkillEntry[];
  surveyAnswers: { question: string; answer: string }[];
  jobDescription: string;
  jobTitle: string;
  company: string;
}

function profileText(skills: SkillEntry[], answers: JobFitInput['surveyAnswers']): string {
  const lines = skills.map((s) => {
    const parts = [`${s.name} (${s.category})`];
    if (s.level) parts.push(`self-rated ${s.level}/5`);
    if (s.years !== null) parts.push(`${s.years} yr`);
    if (s.evidence) parts.push(`evidence: "${s.evidence}"`);
    return `- ${parts.join(' · ')}`;
  });
  const qa = answers.filter((a) => a.answer.trim()).map((a) => `Q: ${a.question}\nA: ${a.answer.trim()}`);
  return [lines.join('\n'), qa.length ? '\nSurvey answers:\n' + qa.join('\n\n') : ''].join('\n');
}

export const jobFit: Exchange<JobFitInput, typeof JobFitReplySchema> = {
  id: 'job-fit',
  title: 'Compare with the job',
  schema: JobFitReplySchema,
  buildPrompt: (input) => buildPrompt({
    task: `Compare the candidate against one job posting.

Step 1 — extract the posting's discrete requirements: one entry per concrete skill, tool, years of
experience, certification, domain or language it asks for. Skip boilerplate (benefits, EEO, culture
text). Mark each "must" if the posting states it as required / essential / minimum, otherwise "nice".
Cap at the 20 most material. Set "roleTitle" to the posting's title (use the candidate's supplied
title if the posting has none).

Step 2 — for each requirement decide the status using the candidate's CV AND self-rated skill
profile: "covered" when the CV or profile clearly shows it (name where in "coveredIn"); "partial" when
the candidate has a genuinely equivalent or adjacent skill (fill "equivalent" with the skill they have
and one sentence on why it transfers — e.g. GCP for AWS, Fabric pipelines for "ETL tooling"); "missing"
otherwise. "partial" MUST have a non-null "equivalent"; "covered" and "missing" must have null.

Step 3 — for every "partial" or "missing" requirement give a concrete "learnSuggestion" (what to learn
and a realistic time, or "cannot be closed quickly" for experience-years bars) and exactly one
"clarifyingQuestion" — specific and answerable, tied to that requirement ("Have you written SQL for
migration validation, and on which database?" — never "Do you have data skills?"). Covered items get
null for both.

Step 4 — "standardRequirements": up to 10 things employers usually expect for this role title that
this posting did NOT mention. These are general role knowledge, not facts about the candidate; give
each a status against the candidate and a one-line note. They are shown separately and never scored.

Step 5 — "emphasisNotes": which existing CV entries to lead with or reorder for this posting, pointing
only at content already there. "overallNotes": a short, honest paragraph on the fit.`,
    rules: [
      NO_FABRICATION_RULE,
      LANGUAGE_RULE,
      'Never output a percentage or score — the app computes the match from priorities and statuses.',
      'Self-rated levels are the candidate\'s own words; treat 1–2 as beginner, 3 as working, 4–5 as strong.',
    ],
    schema: JobFitReplySchema,
    data: [
      { label: 'Job title given by candidate', text: [input.jobTitle, input.company].filter(Boolean).join(' — ') },
      { label: 'Job description', text: input.jobDescription },
      { label: 'Skill profile (self-rated)', text: profileText(input.skills, input.surveyAnswers) },
      { label: 'CV', text: input.cvText },
    ],
  }),
};
