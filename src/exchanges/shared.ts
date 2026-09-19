import { z } from 'zod/v4';

/**
 * A prompt exchange is the app's only "AI backend": it builds a prompt the
 * user carries to any Claude chat, and validates the JSON that comes back.
 */
export interface Exchange<Input, S extends z.ZodTypeAny> {
  id: string;
  title: string;
  schema: S;
  buildPrompt(input: Input): string;
}

export const NO_FABRICATION_RULE = `Hard constraint, non-negotiable: never invent facts. Do not add employers, titles,
dates, credentials, tools, projects or metrics that are not present in the material you are given.
If something would be stronger with a number the candidate has not supplied, write a bracketed
placeholder such as "[add number]" instead of making one up.`;

export const LANGUAGE_RULE = `Write every free-text field in the same language the candidate's CV is written in
(Thai if the CV is in Thai, English if it is in English). Keep JSON keys exactly as the schema names them.`;

export const HARVARD_STYLE = `Resume bullet style: start with a strong, specific action verb; active voice; no first-person
pronouns; one line each; quantified only where the facts given allow it; no filler adjectives and
no clichés such as "leveraged", "results-driven", "cross-functional collaboration", "passionate".`;

interface PromptParts {
  task: string;
  rules: string[];
  schema: z.ZodTypeAny;
  data: { label: string; text: string }[];
}

export function buildPrompt({ task, rules, schema, data }: PromptParts): string {
  const jsonSchema = JSON.stringify(z.toJSONSchema(schema), null, 2);
  const dataBlocks = data
    .map(({ label, text }) => `<<< ${label} >>>\n${text.trim() || '(empty)'}\n<<< end ${label} >>>`)
    .join('\n\n');

  return [
    '# Task',
    task.trim(),
    '',
    '# Rules',
    ...rules.map((r) => `- ${r.trim().replace(/\s+/g, ' ')}`),
    '',
    '# Output format',
    'Reply with ONLY one JSON object that matches this JSON Schema. No prose before or after it, no code fences, no comments.',
    '```json',
    jsonSchema,
    '```',
    '',
    '# Data',
    dataBlocks,
  ].join('\n');
}

export const NonEmpty = z.string().trim().min(1);
