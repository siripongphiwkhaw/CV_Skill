import { describe, expect, it } from 'vitest';
import { computeMatch, scoreBand } from '../score';

describe('computeMatch', () => {
  it('weights must-have three times a nice-to-have', () => {
    const r = computeMatch([
      { priority: 'must', status: 'missing' },
      { priority: 'nice', status: 'covered' },
    ]);
    // 0*3 + 1*1 over 4
    expect(r.percent).toBe(25);
    expect(r.mustPercent).toBe(0);
    expect(r.nicePercent).toBe(100);
  });

  it('counts partial as half', () => {
    const r = computeMatch([{ priority: 'must', status: 'partial' }]);
    expect(r.percent).toBe(50);
    expect(r.counts.must.partial).toBe(1);
  });

  it('treats an accepted index as covered', () => {
    const reqs = [
      { priority: 'must' as const, status: 'missing' as const },
      { priority: 'must' as const, status: 'covered' as const },
    ];
    expect(computeMatch(reqs).percent).toBe(50);
    expect(computeMatch(reqs, new Set([0])).percent).toBe(100);
    expect(computeMatch(reqs, new Set([0])).counts.must.covered).toBe(2);
  });

  it('returns zero for an empty list', () => {
    const r = computeMatch([]);
    expect(r.percent).toBe(0);
    expect(r.band).toBe('poor');
  });

  it('bands at 85 and 60', () => {
    expect(scoreBand(85)).toBe('good');
    expect(scoreBand(84)).toBe('fair');
    expect(scoreBand(60)).toBe('fair');
    expect(scoreBand(59)).toBe('poor');
  });
});
