import type { z } from 'zod/v4';

export type ParseResult<T> = { ok: true; data: T } | { ok: false; errors: string[] };

/** Pulls the first JSON object out of a chat reply that may carry fences or prose around it. */
export function extractJsonText(text: string): string | null {
  const fenced = /```(?:json)?\s*([\s\S]*?)```/i.exec(text);
  const body = fenced?.[1] ?? text;
  const start = body.indexOf('{');
  const end = body.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start) return null;
  return body.slice(start, end + 1);
}

export function parseReply<S extends z.ZodTypeAny>(text: string, schema: S): ParseResult<z.infer<S>> {
  const json = extractJsonText(text);
  if (!json) return { ok: false, errors: ['No JSON object found in the pasted text.'] };

  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch (err) {
    return { ok: false, errors: [`The JSON is not valid: ${err instanceof Error ? err.message : String(err)}`] };
  }

  const result = schema.safeParse(raw);
  if (result.success) return { ok: true, data: result.data };
  const errors = result.error.issues.map((issue) => {
    const path = issue.path.length ? issue.path.map(String).join('.') : '(root)';
    return `${path}: ${issue.message}`;
  });
  return { ok: false, errors };
}
