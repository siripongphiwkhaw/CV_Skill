'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LocaleToggle } from '@/components/LocaleToggle';
import { useT } from '@/lib/i18n/useT';

export default function LoginPage() {
  const router = useRouter();
  const t = useT();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (signInError) { setError('Invalid email or password.'); return; }
    router.push('/');
    router.refresh();
  }

  return (
    <div className="auth-split">
      <div className="auth-brand-panel">
        <div className="auth-brand-head">
          <Link href="/" className="topbar-brand"><span className="topbar-mark" aria-hidden="true" />CVskills</Link>
          <LocaleToggle />
        </div>
        <div className="auth-brand-tagline">{t('auth.login.tagline')}</div>
        <div className="auth-brand-foot">© CVskills</div>
      </div>
      <div className="auth-form-panel">
        <form className="auth-card" onSubmit={onSubmit}>
          <h1>Sign in</h1>
          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
          </label>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
          <p>No account? <Link href="/register">Create one</Link></p>
        </form>
      </div>
    </div>
  );
}
