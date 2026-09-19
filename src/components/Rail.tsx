import type { Step } from '../types/jobFit';
import { AnimatedNumber, RailMark } from './motion';

const STEPS: { label: string; desc: string }[] = [
  { label: 'Profile', desc: 'Skills from your CV + survey' },
  { label: 'Job', desc: 'Paste the posting' },
  { label: 'Compare', desc: 'Match %, gaps, equivalents' },
  { label: 'Update', desc: 'Answer, draft, accept' },
  { label: 'Build', desc: 'Tailored CV, export PDF' },
  { label: 'Interview', desc: 'Questions, scenarios, fit check' },
];

interface Props {
  current: Step;
  maxStep: Step;
  match: number | null;
  onGo: (step: Step) => void;
}

export function Rail({ current, maxStep, match, onGo }: Props) {
  return (
    <aside className="card rail no-print" aria-label="Your progress">
      <div>
        <div className="rail-title">Your progress</div>
        <div className="small">{current - 1} of 6 steps done</div>
        <div className="rail-bar" aria-hidden="true">
          {STEPS.map((_, i) => {
            const n = i + 1;
            return <span key={n} className={n < current ? 'done' : n === current ? 'current' : ''} />;
          })}
        </div>
      </div>
      <div className="rail-steps">
        {STEPS.map((s, i) => {
          const n = (i + 1) as Step;
          const state = n < current ? 'done' : n === current ? 'current' : 'todo';
          return (
            <button
              key={n} type="button" className="rail-step" disabled={n > maxStep}
              aria-current={n === current ? 'step' : undefined} onClick={() => onGo(n)}
            >
              <span className={`rail-dot ${state}`} aria-hidden="true">
                {state === 'done' ? <RailMark done order={i} /> : n}
              </span>
              <span>
                <div className="rail-step-label">{s.label}</div>
                <div className="rail-step-desc">{s.desc}</div>
              </span>
            </button>
          );
        })}
      </div>
      {match !== null && (
        <div className="divider-top">
          <div className="label">Match with this job</div>
          <div className="rail-match"><AnimatedNumber value={match} /> %</div>
        </div>
      )}
    </aside>
  );
}
