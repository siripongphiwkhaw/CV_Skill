import Link from 'next/link';

const STEPS = [
  { label: 'Profile', desc: 'Paste your CV, or build one from a skills survey.' },
  { label: 'Job & match', desc: 'Paste a posting. See your match % and the real gaps.' },
  { label: 'Tailor & build', desc: 'Close what you can, then export a CV built for that role.' },
  { label: 'Interview prep', desc: 'Likely questions, scenarios, and an honest fit check.' },
];

export function Landing() {
  return (
    <div className="landing">
      <header className="landing-nav">
        <div className="topbar-brand"><span className="topbar-mark" aria-hidden="true" />Job Fit CV</div>
        <nav className="row">
          <Link href="/login">Sign in</Link>
          <Link href="/register" className="btn btn-primary">Get started free</Link>
        </nav>
      </header>

      <main>
        <section className="landing-hero">
          <h1>Paste your CV. Paste the job. See exactly what to fix.</h1>
          <p className="hint">
            A four-step workflow that shows your match against a specific posting, closes the real
            gaps, and exports a CV tailored to that role — in the same afternoon you found it.
          </p>
          <div className="row">
            <Link href="/register" className="btn btn-primary">Get started free</Link>
            <Link href="/login" className="btn btn-secondary">Sign in</Link>
          </div>
        </section>

        <section className="landing-mechanic">
          <div className="card-head">
            <h2>How the AI part actually works</h2>
            <p className="hint">
              There's no hidden subscription to our own AI, and nothing to hide: every analysis is a
              prompt you copy into an AI chat you already have — Claude, or another assistant — and a
              reply you paste back in. We validate it and apply it. That's it.
            </p>
          </div>
          <div className="landing-flow">
            <div className="landing-flow-node">
              <span className="label">1</span>
              <p>Your CV and the job posting</p>
            </div>
            <span className="landing-flow-arrow" aria-hidden="true">→</span>
            <div className="landing-flow-node">
              <span className="label">2</span>
              <p>Copy the prompt, paste the reply</p>
            </div>
            <span className="landing-flow-arrow" aria-hidden="true">→</span>
            <div className="landing-flow-node">
              <span className="label">3</span>
              <p>Applied instantly, checked for you</p>
            </div>
          </div>
          <ul className="landing-trust">
            <li>No API key to manage</li>
            <li>No subscription to the app's own AI</li>
            <li>Works with whichever assistant you already use</li>
          </ul>
        </section>

        <section className="landing-steps">
          <h2>Four steps, in order</h2>
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
          <h2>Your next application, taken more seriously.</h2>
          <Link href="/register" className="btn btn-primary">Get started free</Link>
        </section>
      </main>

      <footer className="landing-footer">
        <span>© Job Fit CV</span>
        <Link href="/privacy">Privacy</Link>
      </footer>
    </div>
  );
}
