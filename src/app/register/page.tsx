'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
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

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={onSubmit}>
        <h1>Create your account</h1>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
        </label>
        {error && <p className="auth-error" role="alert">{error}</p>}
        {notice && <p role="status">{notice}</p>}
        <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
        <p>Already have an account? <Link href="/login">Sign in</Link></p>
      </form>
    </div>
  );
}
