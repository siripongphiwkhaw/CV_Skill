import { z } from 'zod/v4';
import type { Cv } from '../types/cv';
import { newId } from '../lib/ids';
import { buildPrompt, LANGUAGE_RULE, NO_FABRICATION_RULE, type Exchange } from './shared';

const LinkSchema = z.object({ label: z.string(), url: z.string() });

export const CvReplySchema = z.object({
  basics: z.object({
    fullName: z.string(),
    email: z.string(),
    phone: z.string(),
    location: z.string(),
    links: z.array(LinkSchema),
  }),
  summary: z.string(),
  education: z.array(z.object({
    institution: z.string(), location: z.string(), degree: z.string(), field: z.string(),
    start: z.string(), end: z.string(), detail: z.string(),
  })),
  experience: z.array(z.object({
    organization: z.string(), location: z.string(), role: z.string(),
    start: z.string(), end: z.string(), bullets: z.array(z.string()),
  })),
  skills: z.array(z.object({ label: z.string(), items: z.array(z.string()) })),
  extras: z.array(z.object({ title: z.string(), items: z.array(z.string()) })),
});
export type CvReply = z.infer<typeof CvReplySchema>;

/** Adds the ids the editor needs; the model never sees or produces them. */
export function cvWithIds(reply: CvReply): Cv {
  return {
    basics: reply.basics,
    summary: reply.summary,
    education: reply.education.map((e) => ({ ...e, id: newId('edu') })),
    experience: reply.experience.map((x) => ({
      ...x,
      id: newId('exp'),
      bullets: x.bullets.filter((t) => t.trim()).map((text) => ({ id: newId('b'), text })),
    })),
    skills: reply.skills.map((g) => ({ ...g, id: newId('sk') })),
    extras: reply.extras.map((x) => ({ ...x, id: newId('ex') })),
  };
}

export const importCv: Exchange<{ cvText: string }, typeof CvReplySchema> = {
  id: 'import-cv',
  title: 'Import CV',
  schema: CvReplySchema,
  buildPrompt: ({ cvText }) => buildPrompt({
    task: `Convert the candidate's pasted CV into the structured JSON document described below.
Extract only what the text states. Leave a field as an empty string or empty array rather than
guessing. Split each bullet point into its own string. Keep dates as short text like "Jan 2024" or
"2024", and use "Present" for current roles. Certifications, awards, languages, volunteering and
anything else without a dedicated field go into "extras" as titled lists — never drop content.`,
    rules: [NO_FABRICATION_RULE, LANGUAGE_RULE, 'Do not fix typos into different facts or expand abbreviations you are not certain of.'],
    schema: CvReplySchema,
    data: [{ label: 'CV', text: cvText }],
  }),
};
