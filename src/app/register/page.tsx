'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { PDPA_CONSENT_VERSION, PdpaNotice } from '@/lib/pdpa';

type Stage = 'pdpa' | 'details';

export default function RegisterPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>('pdpa');
  const [consentChecked, setConsentChecked] = useState(false);
  const [consentAt, setConsentAt] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [tel, setTel] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function onAcceptPdpa() {
    setConsentAt(new Date().toISOString());
    setStage('details');
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
          full_name: fullName,
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
      <Link href="/" className="topbar-brand"><span className="topbar-mark" aria-hidden="true" />Job Fit CV</Link>
      <div>
        <div className="auth-brand-tagline">Free to use. No API key. Ready in a few minutes.</div>
        <ul className="auth-brand-list">
          <li>✓ No API key to manage</li>
          <li>✓ No subscription to the app's own AI</li>
          <li>✓ Works with whichever assistant you already use</li>
        </ul>
      </div>
      <div className="auth-brand-foot">© Job Fit CV</div>
    </div>
  );

  if (stage === 'pdpa') {
    return (
      <div className="auth-split">
        {brandPanel}
        <div className="auth-form-panel">
          <div className="auth-card pdpa-stage">
            <h1>Before you create an account</h1>
            <PdpaNotice />
            <label className="pdpa-consent-row">
              <input
                type="checkbox"
                checked={consentChecked}
                onChange={(e) => setConsentChecked(e.target.checked)}
              />
              I have read and agree to the collection and processing of my personal data as described above.
            </label>
            <button type="button" className="btn btn-primary" disabled={!consentChecked} onClick={onAcceptPdpa}>
              Continue
            </button>
            <p>Already have an account? <Link href="/login">Sign in</Link></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-split">
      {brandPanel}
      <div className="auth-form-panel">
        <form className="auth-card" onSubmit={onSubmit}>
          <h1>Create your account</h1>
          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
          </label>
          <label>
            Full name
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </label>
          <label>
            Tel
            <input type="tel" value={tel} onChange={(e) => setTel(e.target.value)} required />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
          </label>
          {error && <p className="auth-error" role="alert">{error}</p>}
          {notice && <p role="status">{notice}</p>}
          <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
          <p>
            <button type="button" className="link" onClick={() => setStage('pdpa')}>← Back</button>
          </p>
          <p>Already have an account? <Link href="/login">Sign in</Link></p>
        </form>
      </div>
    </div>
  );
}
