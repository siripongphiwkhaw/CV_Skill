import { useMemo } from 'react';
import { PromptExchange } from '../components/PromptExchange';
import { jobFit, type JobFitReply } from '../exchanges';
import { cvToText } from '../lib/cvText';
import type { AppState } from '../state/useAppState';

export function JobStep({ cv, profile, session, patchSession, goTo }: AppState) {
  const input = useMemo(() => ({
    cvText: cvToText(cv),
    skills: profile.skills.filter((s) => s.name.trim()),
    surveyAnswers: profile.surveyAnswers,
    jobDescription: session.jd,
    jobTitle: session.jobTitle,
    company: session.company,
  }), [cv, profile, session.jd, session.jobTitle, session.company]);

  const apply = (reply: JobFitReply) => {
    patchSession({ analysis: reply, accepted: [], answers: {}, builtCv: null, changes: [], interview: null, jobTitle: session.jobTitle || reply.roleTitle });
    goTo(3);
  };

  return (
    <section className="card">
      <div className="card-head">
        <h2>2 · The job you want</h2>
        <p className="hint">Paste the whole posting — requirements, responsibilities, the lot. Boilerplate (benefits, EEO text) is ignored automatically.</p>
      </div>
      <div className="row" style={{ alignItems: 'stretch' }}>
        <label className="field" style={{ flex: 2, minWidth: 220 }}>
          <span>Job title (optional)</span>
          <input type="text" value={session.jobTitle} onChange={(e) => patchSession({ jobTitle: e.target.value })} placeholder="e.g. Business Analyst (SAP & Data)" />
        </label>
        <label className="field" style={{ flex: 1, minWidth: 180 }}>
          <span>Company (optional)</span>
          <input type="text" value={session.company} onChange={(e) => patchSession({ company: e.target.value })} placeholder="e.g. a manufacturing group" />
        </label>
      </div>
      <label className="field">
        <span>Job description</span>
        <textarea rows={14} value={session.jd} onChange={(e) => patchSession({ jd: e.target.value })} placeholder="Paste the posting here." />
      </label>
      <PromptExchange
        exchange={jobFit} input={input} title="Compare with my profile"
        disabled={!session.jd.trim() || input.skills.length === 0}
        disabledReason={!session.jd.trim() ? 'Paste a job description first.' : 'Your profile has no skills yet — go back to step 1.'}
        applied={session.analysis ? `Applied · ${session.analysis.requirements.length} requirements` : null}
        onResult={apply}
      />
      {session.analysis && (
        <div className="row">
          <button type="button" className="btn btn-secondary" onClick={() => goTo(3)}>See the comparison</button>
          <span className="small">Re-running the exchange replaces the current comparison and resets steps 4–6.</span>
        </div>
      )}
    </section>
  );
}
