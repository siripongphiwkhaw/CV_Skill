import { describe, expect, it } from 'vitest';
import { z } from 'zod/v4';
import { extractJsonText, parseReply } from '../parseReply';

const Schema = z.object({ name: z.string(), count: z.number().int() });

describe('parseReply', () => {
  it('accepts a bare JSON object', () => {
    const r = parseReply('{"name":"a","count":2}', Schema);
    expect(r).toEqual({ ok: true, data: { name: 'a', count: 2 } });
  });

  it('strips code fences and surrounding prose', () => {
    const text = 'Sure! Here you go:\n```json\n{"name":"a","count":2}\n```\nLet me know.';
    expect(extractJsonText(text)).toBe('{"name":"a","count":2}');
    expect(parseReply(text, Schema).ok).toBe(true);
  });

  it('finds the object inside prose without fences', () => {
    const r = parseReply('Result: {"name":"a","count":2} — done', Schema);
    expect(r.ok).toBe(true);
  });

  it('reports invalid JSON', () => {
    const r = parseReply('{"name": "a", count: }', Schema);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors[0]).toMatch(/not valid/);
  });

  it('reports schema errors with a path', () => {
    const r = parseReply('{"name":"a","count":"two"}', Schema);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors[0]).toMatch(/^count:/);
  });

  it('reports when nothing looks like JSON', () => {
    const r = parseReply('no json here', Schema);
    expect(r.ok).toBe(false);
  });
});
