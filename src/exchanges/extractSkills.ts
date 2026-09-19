import { z } from 'zod/v4';
import { SKILL_CATEGORIES } from '../types/profile';
import { buildPrompt, LANGUAGE_RULE, NO_FABRICATION_RULE, type Exchange } from './shared';

export const ExtractSkillsReplySchema = z.object({
  skills: z.array(z.object({
    name: z.string(),
    category: z.enum(SKILL_CATEGORIES),
    /** Verbatim quote from the CV, or null when the skill is only listed by name. */
    evidence: z.string().nullable(),
    inferredLevel: z.number().int().min(1).max(5).nullable(),
  })).max(40),
  followUpQuestions: z.array(z.string()).max(5),
});
export type ExtractSkillsReply = z.infer<typeof ExtractSkillsReplySchema>;

export const extractSkills: Exchange<{ cvText: string }, typeof ExtractSkillsReplySchema> = {
  id: 'extract-skills',
  title: 'Extract skills',
  schema: ExtractSkillsReplySchema,
  buildPrompt: ({ cvText }) => buildPrompt({
    task: `Read the candidate's CV and list every distinct skill it demonstrates or names — technical
skills, tools and platforms, domain knowledge, soft skills that a bullet actually shows (not
adjectives), languages, and certifications. Merge duplicates and near-duplicates into one entry
with the most specific name. For each skill, quote the CV sentence that demonstrates it verbatim in
"evidence"; if the skill only appears in a skills list, set evidence to null. "inferredLevel" is your
honest 1–5 guess at proficiency from the evidence alone (null when there is no basis), which the
candidate will correct.

Then write up to 5 follow-up questions about skills the CV implies but does not state — e.g. a bullet
mentions dashboards but no BI tool, or an integration project but no method. Each question must be
specific and answerable in one or two sentences.`,
    rules: [NO_FABRICATION_RULE, LANGUAGE_RULE, 'Cap at the 40 most material skills.'],
    schema: ExtractSkillsReplySchema,
    data: [{ label: 'CV', text: cvText }],
  }),
};
