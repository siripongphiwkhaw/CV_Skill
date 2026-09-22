'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import { LocaleToggle } from './LocaleToggle';
import { HeroLogo3D } from './HeroLogo3D';
import { useT } from '../lib/i18n/useT';

export function Landing() {
  const t = useT();
  const reduced = useReducedMotion();

  const STEPS = [
    { label: t('landing.step1Title'), desc: t('landing.step1Desc') },
    { label: t('landing.step2Title'), desc: t('landing.step2Desc') },
    { label: t('landing.step3Title'), desc: t('landing.step3Desc') },
    { label: t('landing.step4Title'), desc: t('landing.step4Desc') },
  ];

  return (
    <div className="landing">
      <div className="landing-hero-dark">
        <header className="landing-nav">
          <div className="topbar-brand"><span className="topbar-mark" aria-hidden="true" />CVskills</div>
          <nav className="row">
            <LocaleToggle />
            <Link href="/login">{t('landing.navSignIn')}</Link>
            <Link href="/register" className="btn btn-primary">{t('landing.navGetStarted')}</Link>
          </nav>
        </header>

        <section className="hero-band">
          <HeroLogo3D />
          <h1>{t('landing.heroDarkTitle')}</h1>
          <p>{t('landing.heroDarkSubhead')}</p>
          <Link href="/register" className="btn btn-primary">{t('landing.navGetStarted')}</Link>
        </section>

        <motion.a
          href="#how-it-works"
          className="hero-scroll"
          aria-label={t('landing.heroScrollHint')}
          animate={reduced ? undefined : { y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </motion.a>
      </div>

      <main>
        <section className="landing-mechanic" id="how-it-works">
          <div className="card-head">
            <h2>{t('landing.mechanicTitle')}</h2>
            <p className="hint">{t('landing.mechanicBody')}</p>
          </div>
          <div className="landing-flow">
            <div className="landing-flow-node">
              <span className="label">1</span>
              <p>{t('landing.flow1')}</p>
            </div>
            <span className="landing-flow-arrow" aria-hidden="true">→</span>
            <div className="landing-flow-node">
              <span className="label">2</span>
              <p>{t('landing.flow2')}</p>
            </div>
            <span className="landing-flow-arrow" aria-hidden="true">→</span>
            <div className="landing-flow-node">
              <span className="label">3</span>
              <p>{t('landing.flow3')}</p>
            </div>
          </div>
          <ul className="landing-trust">
            <li>{t('landing.trust1')}</li>
            <li>{t('landing.trust2')}</li>
            <li>{t('landing.trust3')}</li>
          </ul>
        </section>

        <section className="landing-steps">
          <h2>{t('landing.stepsTitle')}</h2>
          <ol className="landing-steps-rail">
            {STEPS.map((s, i) => (
              <li key={s.label}>
                <span className="rail-dot" aria-hidden="true">{i + 1}</span>
                <div>
                  <div className="rail-step-label">{s.label}</div>
                  <p className="small">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="landing-cta">
          <h2>{t('landing.closingTitle')}</h2>
          <Link href="/register" className="btn btn-primary">{t('landing.navGetStarted')}</Link>
        </section>
      </main>

      <footer className="landing-footer">
        <span>© CVskills</span>
        <Link href="/privacy">{t('landing.footerPrivacy')}</Link>
      </footer>
    </div>
  );
}
