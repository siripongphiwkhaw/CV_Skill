import { z } from 'zod/v4';
import { buildPrompt, LANGUAGE_RULE, NO_FABRICATION_RULE, type Exchange } from './shared';

export const InterviewPrepReplySchema = z.object({
  questions: z.array(z.object({
    question: z.string(),
    kind: z.enum(['behavioral', 'technical', 'case']),
    /** Points at something already on the CV, or names the gap to prepare for. */
    hintFromCv: z.string(),
  })).min(6).max(8),
  scenarios: z.array(z.object({
    title: z.string(),
    description: z.string(),
    skillsUsed: z.array(z.string()),
  })).length(3),
  reflectionPrompts: z.array(z.string()).length(3),
});
export type InterviewPrepReply = z.infer<typeof InterviewPrepReplySchema>;

export interface InterviewPrepInput {
  cvText: string;
  jobDescription: string;
  roleTitle: string;
  requirementSummary: string;
}

export const interviewPrep: Exchange<InterviewPrepInput, typeof InterviewPrepReplySchema> = {
  id: 'interview-prep',
  title: 'Interview prep',
  schema: InterviewPrepReplySchema,
  buildPrompt: (input) => buildPrompt({
    task: `Help the candidate decide whether they want this job, and prepare if they do.

1. "questions": 6–8 questions an interviewer for THIS posting is likely to ask — a mix of behavioral,
   technical and case. For each, "hintFromCv" names the specific CV entry or bullet the candidate
   should draw on, or, when the question targets a gap from the comparison, says so plainly and what
   to prepare.
2. "scenarios": exactly 3 short, concrete "a week in this job" scenarios built from the posting's
   responsibilities — what actually lands on this person's desk, what they do about it, who they talk
   to. Each lists the skills used.
3. "reflectionPrompts": exactly 3 honest yes/no-style questions about whether the candidate would enjoy
   this work day to day, grounded in the scenarios and the gaps (e.g. willingness to spend weeks
   learning something, comfort with being the most junior person, share of time in meetings).`,
    rules: [NO_FABRICATION_RULE, LANGUAGE_RULE, 'Hints must reference real CV content or a real gap — never a made-up achievement.'],
    schema: InterviewPrepReplySchema,
    data: [
      { label: 'Target role', text: input.roleTitle },
      { label: 'Job description', text: input.jobDescription },
      { label: 'Comparison summary', text: input.requirementSummary },
      { label: 'CV', text: input.cvText },
    ],
  }),
};
