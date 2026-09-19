import type { MatchStatus, Priority } from '../types/jobFit';

const PRIORITY_WEIGHT: Record<Priority, number> = { must: 3, nice: 1 };
const STATUS_VALUE: Record<MatchStatus, number> = { covered: 1, partial: 0.5, missing: 0 };

export type Band = 'good' | 'fair' | 'poor';

export interface MatchResult {
  percent: number;
  mustPercent: number;
  nicePercent: number;
  band: Band;
  counts: Record<Priority, Record<MatchStatus, number>>;
}

interface Scorable {
  priority: Priority;
  status: MatchStatus;
}

export function scoreBand(percent: number): Band {
  if (percent >= 85) return 'good';
  if (percent >= 60) return 'fair';
  return 'poor';
}

/** Match % is plain arithmetic over the requirement list — the model never returns a number. */
export function computeMatch(requirements: Scorable[], accepted: Set<number> = new Set()): MatchResult {
  let weighted = 0;
  let weightedTotal = 0;
  const perPriority: Record<Priority, { got: number; total: number }> = {
    must: { got: 0, total: 0 }, nice: { got: 0, total: 0 },
  };
  const counts: MatchResult['counts'] = {
    must: { covered: 0, partial: 0, missing: 0 },
    nice: { covered: 0, partial: 0, missing: 0 },
  };

  requirements.forEach((r, i) => {
    const status: MatchStatus = accepted.has(i) ? 'covered' : r.status;
    const value = STATUS_VALUE[status];
    const weight = PRIORITY_WEIGHT[r.priority];
    weighted += value * weight;
    weightedTotal += weight;
    perPriority[r.priority].got += value;
    perPriority[r.priority].total += 1;
    counts[r.priority][status] += 1;
  });

  const pct = (got: number, total: number) => (total === 0 ? 0 : Math.round((got / total) * 100));
  const percent = pct(weighted, weightedTotal);
  return {
    percent,
    mustPercent: pct(perPriority.must.got, perPriority.must.total),
    nicePercent: pct(perPriority.nice.got, perPriority.nice.total),
    band: scoreBand(percent),
    counts,
  };
}
