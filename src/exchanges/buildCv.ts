import { z } from 'zod/v4';
import type { Cv } from '../types/cv';
import { cvToText } from '../lib/cvText';
import { CvReplySchema } from './importCv';
import { buildPrompt, HARVARD_STYLE, LANGUAGE_RULE, NO_FABRICATION_RULE, type Exchange } from './shared';

export const BuildCvReplySchema = z.object({
  cv: CvReplySchema,
  /** One line per edit, so the candidate can see exactly what moved or was reworded. */
  changes: z.array(z.string()).max(30),
});
export type BuildCvReply = z.infer<typeof BuildCvReplySchema>;

export interface BuildCvInput {
  cv: Cv;
  jobDescription: string;
  roleTitle: string;
  emphasisNotes: { section: string; entry: string; suggestion: string }[];
}

export const buildCv: Exchange<BuildCvInput, typeof BuildCvReplySchema> = {
  id: 'build-cv',
  title: 'Build the CV for this job',
  schema: BuildCvReplySchema,
  buildPrompt: (input) => buildPrompt({
    task: `Produce the candidate's CV tailored to this posting, as the same structured JSON document.
Tailoring means: reorder entries and bullets so the most relevant come first; reword bullets so they
lead with the verbs and terms the posting uses; regroup or relabel skill groups so the ones this role
wants are first; tighten wording to one line per bullet. It never means adding a skill, tool,
employer, date or number that is not already in the CV, and never means deleting a role. Keep the
candidate's contact details exactly as given. Every edit you make gets one plain-language line in
"changes" ("Moved the SAP integration bullet to the top of the Ajinomoto entry").`,
    rules: [NO_FABRICATION_RULE, HARVARD_STYLE, LANGUAGE_RULE, 'Keep every bracketed placeholder such as "[number]" as it is.'],
    schema: BuildCvReplySchema,
    data: [
      { label: 'Target role', text: input.roleTitle },
      { label: 'Job description', text: input.jobDescription },
      { label: 'Emphasis notes from the comparison', text: input.emphasisNotes.map((n) => `- ${n.section} › ${n.entry}: ${n.suggestion}`).join('\n') },
      { label: 'Current CV (structured JSON)', text: JSON.stringify(stripIds(input.cv), null, 2) },
      { label: 'Current CV (plain text, for reading order)', text: cvToText(input.cv) },
    ],
  }),
};

function stripIds(cv: Cv): z.infer<typeof CvReplySchema> {
  return {
    basics: cv.basics,
    summary: cv.summary,
    education: cv.education.map(({ id: _id, ...e }) => e),
    experience: cv.experience.map(({ id: _id, bullets, ...x }) => ({ ...x, bullets: bullets.map((b) => b.text) })),
    skills: cv.skills.map(({ id: _id, ...g }) => g),
    extras: cv.extras.map(({ id: _id, ...x }) => x),
  };
}
