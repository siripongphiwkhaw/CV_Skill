'use client';

import { motion, useReducedMotion } from 'motion/react';
import { Rail } from '../components/Rail';
import { TopBar } from '../components/TopBar';
import { computeMatch } from '../lib/score';
import { maxReachableStep, useAppState, type InitialAppData } from '../state/useAppState';
import { InterviewStep } from '../steps/InterviewStep';
import { JobMatchStep } from '../steps/JobMatchStep';
import { ProfileStep } from '../steps/ProfileStep';
import { TailorBuildStep } from '../steps/TailorBuildStep';

export function AppClient(initial: InitialAppData) {
  const state = useAppState(initial);
  const { cv, profile, session, goTo } = state;
  const reduce = useReducedMotion();
  const maxStep = maxReachableStep(cv, profile, session);
  const step = Math.min(session.step, maxStep) as typeof session.step;
  const match = session.analysis
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
          {step === 2 && <JobMatchStep {...state} />}
          {step === 3 && <TailorBuildStep {...state} />}
          {step === 4 && <InterviewStep {...state} />}
        </motion.main>
      </div>
    </>
  );
}
