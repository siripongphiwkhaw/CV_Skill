'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { PDPA_CONSENT_VERSION, PdpaNotice } from '@/lib/pdpa';
import { LocaleToggle } from '@/components/LocaleToggle';
import { useT } from '@/lib/i18n/useT';

type RegStep = 1 | 2 | 3 | 4;

const TOTAL_STEPS = 4;

function RegisterSteps({ step }: { step: RegStep }) {
  return (
    <div className="auth-steps-row">
      <ol className="auth-steps">
        {[1, 2, 3, 4].map((n) => (
          <li
            key={n}
            className={n <= step ? 'done' : ''}
            aria-current={n === step ? 'step' : undefined}
          />
        ))}
      </ol>
      <span className="auth-step-count">Step {step} of {TOTAL_STEPS}</span>
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const t = useT();
  const [step, setStep] = useState<RegStep>(1);
  const [consentChecked, setConsentChecked] = useState(false);
  const [consentAt, setConsentAt] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [tel, setTel] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const firstFieldRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    firstFieldRef.current?.focus();
  }, [step]);

  const passwordOk = password.length >= 8;

  function onAcceptPdpa() {
    setConsentAt(new Date().toISOString());
    setStep(2);
  }

  function goNext(e: FormEvent) {
    e.preventDefault();
    setStep((s) => Math.min(TOTAL_STEPS, s + 1) as RegStep);
  }

  function goBack() {
    setError(null);
    setStep((s) => Math.max(1, s - 1) as RegStep);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`.trim(),
          phone: tel,
          pdpa_consent_at: consentAt,
          pdpa_consent_version: PDPA_CONSENT_VERSION,
        },
      },
    });
    setBusy(false);

    if (signUpError) {
      setError(signUpError.message === 'User already registered'
        ? 'An account with that email already exists.'
        : signUpError.message);
      return;
    }

    if (!data.session) {
      // Email confirmation is required before a session is issued.
      setNotice('Check your email to confirm your account, then sign in.');
      return;
    }

    router.push('/');
    router.refresh();
  }

  const brandPanel = (
    <div className="auth-brand-panel">
      <div className="auth-brand-head">
        <Link href="/" className="topbar-brand"><span className="topbar-mark" aria-hidden="true" />CVskills</Link>
        <LocaleToggle />
      </div>
      <div>
        <div className="auth-brand-tagline">{t('auth.register.tagline')}</div>
        <ul className="auth-brand-list">
          <li>✓ {t('landing.trust1')}</li>
          <li>✓ {t('landing.trust2')}</li>
          <li>✓ {t('landing.trust3')}</li>
        </ul>
      </div>
      <div className="auth-brand-foot">© CVskills</div>
    </div>
  );

  const emailSummary = (
    <div className="auth-email-summary">
      <span>{email}</span>
      <button type="button" className="link" onClick={() => setStep(2)}>Change</button>
    </div>
  );

  const signInLine = <p>Already have an account? <Link href="/login">Sign in</Link></p>;

  function shell(card: React.ReactNode) {
    return (
      <div className="auth-split">
        {brandPanel}
        <div className="auth-form-panel">{card}</div>
      </div>
    );
  }

  if (step === 1) {
    return shell(
      <div className="auth-card pdpa-stage">
        <RegisterSteps step={1} />
        <h1>Before you create an account</h1>
        <PdpaNotice />
        <label className="pdpa-consent-row">
          <input
            type="checkbox"
            checked={consentChecked}
            onChange={(e) => setConsentChecked(e.target.checked)}
          />
          {t('auth.register.pdpaConsentLabel')}
        </label>
        <button type="button" className="btn btn-primary" disabled={!consentChecked} onClick={onAcceptPdpa}>
          Continue
        </button>
        {signInLine}
      </div>
    );
  }

  if (step === 2) {
    return shell(
      <form className="auth-card" onSubmit={goNext}>
        <RegisterSteps step={2} />
        <h1>What&apos;s your email?</h1>
        <p className="auth-lede">{t('auth.register.step2Lede')}</p>
        <label>
          Email address
          <input
            ref={firstFieldRef}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </label>
        <button type="submit" className="btn btn-primary">Continue</button>
        <div className="auth-card-foot">
          <button type="button" className="link" onClick={goBack}>← Back</button>
          <span>Have an account? <Link href="/login">Sign in</Link></span>
        </div>
      </form>
    );
  }

  if (step === 3) {
    return shell(
      <form className="auth-card" onSubmit={goNext}>
        <RegisterSteps step={3} />
        <h1>Create a password</h1>
        {emailSummary}
        <label>
          Password
          <span className="auth-pw-field">
            <input
              ref={firstFieldRef}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
            <button type="button" className="link" onClick={() => setShowPassword((v) => !v)}>
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </span>
        </label>
        <p className={passwordOk ? 'auth-field-hint ok' : 'auth-field-hint'}>At least 8 characters</p>
        <button type="submit" className="btn btn-primary" disabled={!passwordOk}>Continue</button>
        <div className="auth-card-foot">
          <button type="button" className="link" onClick={goBack}>← Back</button>
        </div>
      </form>
    );
  }

  return shell(
    <form className="auth-card" onSubmit={onSubmit}>
      <RegisterSteps step={4} />
      <h1>About you</h1>
      {emailSummary}
      <div className="auth-name-row">
        <label>
          First name
          <input
            ref={firstFieldRef}
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            autoComplete="given-name"
          />
        </label>
        <label>
          Last name
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            autoComplete="family-name"
          />
        </label>
      </div>
      <label>
        Phone
        <input
          type="tel"
          value={tel}
          onChange={(e) => setTel(e.target.value)}
          required
          autoComplete="tel"
        />
      </label>
      {error && <p className="auth-error" role="alert">{error}</p>}
      {notice && <p className="auth-notice" role="status">{notice}</p>}
      <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
      <div className="auth-card-foot">
        <button type="button" className="link" onClick={goBack}>← Back</button>
        <span>Have an account? <Link href="/login">Sign in</Link></span>
      </div>
    </form>
  );
}
