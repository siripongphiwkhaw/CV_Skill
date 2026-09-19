import { Children, useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import CountUp from '../reactbits/CountUp/CountUp';
import StatusMark from '../reactbits/StatusMark/StatusMark';

/** Staggers its children in — the one orchestrated entrance a step gets. Budget stays under 400 ms. */
export function Cascade({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  const items = Children.toArray(children);
  const stagger = Math.min(0.05, 0.35 / Math.max(1, items.length));
  if (reduce) return <div className={className}>{items}</div>;
  return (
    <motion.div className={className} initial="hidden" animate="show" transition={{ staggerChildren: stagger }}>
      {items.map((child, i) => (
        <motion.div
          key={i}
          variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.28, ease: [0.2, 0, 0, 1] }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

/** A number that counts from its previous value to the new one instead of jumping. */
export function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  const prev = useRef(0);
  const from = prev.current;
  useEffect(() => { prev.current = value; }, [value]);
  const reduce = useReducedMotion();
  if (reduce) return <span className={className}>{value}</span>;
  // CountUp maps duration to a spring (damping 20 + 40/d, stiffness 100/d); 0.3 settles in ~0.5 s instead of creeping.
  return <CountUp from={from} to={value} duration={0.3} className={className} />;
}

/** A completed-step mark that draws its check shortly after it appears, so finishing a step is visible. */
export function RailMark({ done, order }: { done: boolean; order: number }) {
  const [status, setStatus] = useState<'pending' | 'done'>('pending');
  useEffect(() => {
    if (!done) { setStatus('pending'); return; }
    const t = window.setTimeout(() => setStatus('done'), 80 + order * 70);
    return () => window.clearTimeout(t);
  }, [done, order]);
  return (
    <StatusMark
      status={status} size={18} strokeWidth={2.5} fillOpacity={0}
      color="var(--color-positive)" doneColor="var(--color-positive)"
    />
  );
}
