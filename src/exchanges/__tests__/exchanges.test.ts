import { describe, expect, it } from 'vitest';
import { cvWithIds, extractSkills, importCv, jobFit } from '../index';
import { parseReply } from '../../lib/parseReply';
import { emptyCv } from '../../types/cv';

describe('prompt building', () => {
  it('embeds the task, the schema and every data block', () => {
    const prompt = importCv.buildPrompt({ cvText: 'Jane Doe — Analyst' });
    expect(prompt).toContain('# Task');
    expect(prompt).toContain('"fullName"');
    expect(prompt).toContain('<<< CV >>>\nJane Doe — Analyst\n<<< end CV >>>');
    expect(prompt).toContain('never invent facts');
  });

  it('flattens the profile into the job-fit prompt', () => {
    const prompt = jobFit.buildPrompt({
      cvText: 'x', jobDescription: 'Need SQL', jobTitle: 'Analyst', company: '',
      skills: [{ id: 's1', name: 'SQL', category: 'technical', level: 3, years: 2, evidence: 'wrote SQL', source: 'cv' }],
      surveyAnswers: [{ question: 'Which DB?', answer: 'Postgres' }],
    });
    expect(prompt).toContain('- SQL (technical) · self-rated 3/5 · 2 yr · evidence: "wrote SQL"');
    expect(prompt).toContain('Q: Which DB?\nA: Postgres');
  });
});

describe('reply validation', () => {
  it('accepts a valid extract-skills reply and rejects a bad category', () => {
    const good = JSON.stringify({ skills: [{ name: 'SQL', category: 'technical', evidence: null, inferredLevel: 3 }], followUpQuestions: [] });
    expect(parseReply(good, extractSkills.schema).ok).toBe(true);
    const bad = JSON.stringify({ skills: [{ name: 'SQL', category: 'magic', evidence: null, inferredLevel: 3 }], followUpQuestions: [] });
    expect(parseReply(bad, extractSkills.schema).ok).toBe(false);
  });

  it('adds ids when importing a CV', () => {
    const base = emptyCv();
    const cv = cvWithIds({
      ...base,
      education: [],
      experience: [{ organization: 'A', location: '', role: 'R', start: '', end: '', bullets: ['one', ' '] }],
      skills: [{ label: 'Tools', items: ['x'] }],
      extras: [],
    });
    expect(cv.experience[0]?.id).toMatch(/^exp_/);
    expect(cv.experience[0]?.bullets).toHaveLength(1);
    expect(cv.experience[0]?.bullets[0]?.id).toMatch(/^b_/);
    expect(cv.skills[0]?.id).toMatch(/^sk_/);
  });
});
