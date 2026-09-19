import { motion, useReducedMotion } from 'motion/react';
import type { MatchStatus, Priority } from '../types/jobFit';
import { AnimatedNumber } from './motion';

const STATUS_LABEL: Record<MatchStatus, string> = { covered: 'Covered', partial: 'Partial', missing: 'Missing' };

export function StatusChip({ status, priority, fixed }: { status: MatchStatus; priority?: Priority; fixed?: boolean }) {
  return (
    <span className={`chip chip-${status}${fixed ? ' chip-fixed' : ''}`}>
      {STATUS_LABEL[status]}{priority ? ` · ${priority}` : ''}
    </span>
  );
}

const RING_C = 2 * Math.PI * 44;

export function ScoreRing({ percent, label, note, color }: { percent: number; label: string; note?: string; color: string }) {
  const reduce = useReducedMotion();
  const dash = (Math.max(0, Math.min(100, percent)) / 100) * RING_C;
  return (
    <div className="ring">
      <div className="ring-figure" role="img" aria-label={`${label} ${percent} percent`}>
        <svg width="104" height="104" viewBox="0 0 104 104" aria-hidden="true">
          <circle cx="52" cy="52" r="44" fill="none" stroke="var(--color-rule-soft)" strokeWidth="10" />
          <motion.circle
            cx="52" cy="52" r="44" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
            transform="rotate(-90 52 52)"
            initial={reduce ? false : { strokeDasharray: `0 ${RING_C}` }}
            animate={{ strokeDasharray: `${dash} ${RING_C}` }}
            transition={{ duration: 0.9, ease: [0.2, 0, 0, 1] }}
          />
        </svg>
        <div className="ring-value" aria-hidden="true"><AnimatedNumber value={percent} />%</div>
      </div>
      <div>
        <div className="ring-label">{label}</div>
        {note && <div className="small">{note}</div>}
      </div>
    </div>
  );
}
