import { motion, useReducedMotion } from 'motion/react';
import { Rail } from './components/Rail';
import { TopBar } from './components/TopBar';
import { computeMatch } from './lib/score';
import { maxReachableStep, useAppState } from './state/useAppState';
import { BuildStep } from './steps/BuildStep';
import { CompareStep } from './steps/CompareStep';
import { InterviewStep } from './steps/InterviewStep';
import { JobStep } from './steps/JobStep';
import { ProfileStep } from './steps/ProfileStep';
import { UpdateStep } from './steps/UpdateStep';

export default function App() {
  const state = useAppState();
  const { cv, profile, session, goTo } = state;
  const reduce = useReducedMotion();
  const maxStep = maxReachableStep(cv, profile, session);
  const step = Math.min(session.step, maxStep) as typeof session.step;
  const match = session.analysis && step >= 3
    ? computeMatch(session.analysis.requirements, new Set(session.accepted)).percent
    : null;

  return (
    <>
      <TopBar name={cv.basics.fullName} maxStep={maxStep} onGo={goTo} />
      <div className="page">
        <div className="rail-col">
          <Rail current={step} maxStep={maxStep} match={match} onGo={goTo} />
        </div>
        <motion.main
          key={step} className="main"
          initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, ease: [0.2, 0, 0, 1] }}
        >
          {step === 1 && <ProfileStep {...state} />}
          {step === 2 && <JobStep {...state} />}
          {step === 3 && <CompareStep {...state} />}
          {step === 4 && <UpdateStep {...state} />}
          {step === 5 && <BuildStep {...state} />}
          {step === 6 && <InterviewStep {...state} />}
        </motion.main>
      </div>
    </>
  );
}
