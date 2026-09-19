import { z } from 'zod/v4';
import { buildPrompt, HARVARD_STYLE, LANGUAGE_RULE, NO_FABRICATION_RULE, type Exchange } from './shared';

export const DraftBulletReplySchema = z.object({
  variants: z.array(z.object({ text: z.string(), whatChanged: z.string() })).min(1).max(3),
  /** Set when a stronger bullet needs a fact the candidate has not given. */
  missingInfoPrompt: z.string().nullable(),
});
export type DraftBulletReply = z.infer<typeof DraftBulletReplySchema>;

export interface DraftBulletInput {
  requirement: string;
  answer: string;
  role: string;
  organization: string;
}

export const draftBullet: Exchange<DraftBulletInput, typeof DraftBulletReplySchema> = {
  id: 'draft-bullet',
  title: 'Draft a bullet',
  schema: DraftBulletReplySchema,
  buildPrompt: (input) => buildPrompt({
    task: `The candidate was asked about a job requirement their CV does not yet show, and answered in
their own words. Turn that answer into up to three one-line resume bullets that address the
requirement, each differing in emphasis or verb — not three restatements. Use only what the answer
says; where a number or tool name would make it stronger but was not given, leave a bracketed
placeholder like "[number]" or "[database]" and describe what is missing in "missingInfoPrompt".
"whatChanged" is one short clause per variant.`,
    rules: [NO_FABRICATION_RULE, HARVARD_STYLE, LANGUAGE_RULE],
    schema: DraftBulletReplySchema,
    data: [
      { label: 'Requirement', text: input.requirement },
      { label: 'Role the bullet will sit under', text: [input.role, input.organization].filter(Boolean).join(' — ') },
      { label: "Candidate's answer", text: input.answer },
    ],
  }),
};
