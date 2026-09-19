import { useMemo, useState } from 'react';
import { PromptExchange } from '../components/PromptExchange';
import { CvDocument } from '../cv/CvDocument';
import { buildCv, cvWithIds, type BuildCvReply } from '../exchanges';
import { computeMatch } from '../lib/score';
import HoldButton from '../reactbits/HoldButton/HoldButton';
import type { AppState } from '../state/useAppState';
import type { Cv } from '../types/cv';

export function BuildStep({ cv, setCv, session, patchSession, goTo }: AppState) {
  const analysis = session.analysis;
  const [toast, setToast] = useState<string | null>(null);
  const shown: Cv = session.builtCv ?? cv;
  const match = analysis ? computeMatch(analysis.requirements, new Set(session.accepted)) : null;

  const input = useMemo(() => ({
    cv,
    jobDescription: session.jd,
    roleTitle: analysis?.roleTitle || session.jobTitle,
    emphasisNotes: analysis?.emphasisNotes ?? [],
  }), [cv, session.jd, session.jobTitle, analysis]);

  const apply = (reply: BuildCvReply) => {
    patchSession({ builtCv: cvWithIds(reply.cv), changes: reply.changes });
  };

  const editBullet = (experienceId: string, bulletId: string, text: string) => {
    const next: Cv = {
      ...shown,
      experience: shown.experience.map((x) => (x.id === experienceId ? { ...x, bullets: x.bullets.map((b) => (b.id === bulletId ? { ...b, text } : b)) } : x)),
    };
    if (session.builtCv) patchSession({ builtCv: next }); else setCv(next);
  };

  const flash = (message: string) => { setToast(message); window.setTimeout(() => setToast(null), 3000); };

  return (
    <>
      <section className="card no-print">
        <div className="card-head-row">
          <div className="card-head">
            <h2>5 · Your CV for this job</h2>
            <p className="hint">Harvard style, one column, no tables — so any applicant tracking system reads it in order. Export uses your browser's print-to-PDF, which keeps the text selectable.</p>
          </div>
          <div className="row">
            {match && <span className="chip chip-info">Match {match.percent}%</span>}
            <button type="button" className="btn btn-primary" onClick={() => window.print()}>Export PDF</button>
          </div>
        </div>
        <PromptExchange
          exchange={buildCv} input={input} title="Build the CV for this job"
          disabled={!session.jd.trim()} disabledReason="Paste a job description in step 2 first."
          applied={session.builtCv ? `Applied · ${session.changes.length} changes` : null}
          onResult={apply}
        />
        {session.builtCv && (
          <div className="row">
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setCv(session.builtCv as Cv); flash('This version is now your main CV.'); }}>Use this as my main CV</button>
            <HoldButton
              size="sm" radius={8} holdTime={1000} glow={false} resetAfter={0} className="hb-outline"
              backgroundColor="var(--color-card)" fillColor="var(--color-critical)" textColor="var(--color-ink-2)" fillTextColor="#ffffff"
              doneLabel="Discarded" onHold={() => patchSession({ builtCv: null, changes: [] })}
            >
              Hold to discard tailored version
            </HoldButton>
            <span className="small">Showing the tailored version. Click any bullet on the page to edit it.</span>
          </div>
        )}
      </section>

      {session.changes.length > 0 && (
        <section className="card no-print">
          <h4>What changed for this job</h4>
          <ol style={{ margin: 0, paddingLeft: 20 }} className="stack">
            {session.changes.map((c, i) => <li key={i}>{c}</li>)}
          </ol>
          <p className="small divider-top">No facts added or removed — only order, emphasis and wording.</p>
        </section>
      )}

      <div className="print-only">
        <CvDocument cv={shown} onEditBullet={editBullet} />
      </div>

      <div className="row no-print">
        <button type="button" className="btn btn-primary" onClick={() => goTo(6)}>Continue to Interview prep</button>
        <button type="button" className="btn btn-secondary" onClick={() => goTo(4)}>Back to Update</button>
        <span className="small">Bracketed [placeholders] are yours to fill before exporting.</span>
      </div>
      {toast && <div className="toast" role="status">{toast}</div>}
    </>
  );
}
