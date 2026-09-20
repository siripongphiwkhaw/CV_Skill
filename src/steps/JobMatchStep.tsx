import { useMemo, useState } from 'react';
import { PromptExchange } from '../components/PromptExchange';
import { ScoreRing, StatusChip } from '../components/bits';
import { Cascade } from '../components/motion';
import { jobFit, type JobFitReply } from '../exchanges';
import { cvToText } from '../lib/cvText';
import { computeMatch } from '../lib/score';
import type { AppState } from '../state/useAppState';
import type { Requirement } from '../types/jobFit';

const BAND_LABEL = { good: 'Strong match', fair: 'Fair match', poor: 'Weak match' } as const;
const BAND_CHIP = { good: 'chip-covered', fair: 'chip-partial', poor: 'chip-missing' } as const;

export function JobMatchStep({ cv, profile, session, patchSession, goTo }: AppState) {
  const [showStandard, setShowStandard] = useState(true);

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
  };

  const analysis = session.analysis;
  const accepted = new Set(session.accepted);
  const match = analysis ? computeMatch(analysis.requirements, accepted) : null;
  const must = analysis ? analysis.requirements.map((r, i) => ({ r, i })).filter(({ r }) => r.priority === 'must') : [];
  const nice = analysis ? analysis.requirements.map((r, i) => ({ r, i })).filter(({ r }) => r.priority === 'nice') : [];
  const gaps = analysis ? analysis.requirements.filter((r, i) => r.status !== 'covered' && !accepted.has(i)).length : 0;
  const countLine = (p: 'must' | 'nice') => match ? `${match.counts[p].covered} covered · ${match.counts[p].partial} partial · ${match.counts[p].missing} missing` : '';

  return (
    <>
      <section className="card">
        <div className="card-head">
          <h2>2 · Job & match</h2>
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
          applied={analysis ? `Applied · ${analysis.requirements.length} requirements` : null}
          onResult={apply}
        />
        {analysis && <p className="small">Re-running the exchange replaces the comparison below and resets steps 3–4.</p>}
      </section>

      {analysis && match && (
        <>
          <section className="card">
            <div className="card-head-row">
              <div className="card-head">
                <h3>How you match — {analysis.roleTitle || session.jobTitle || 'this job'}</h3>
                <p className="hint">Numbers are computed here from the requirement list (must-have ×3, nice-to-have ×1; partial counts half), not by the model.</p>
              </div>
              <span className={`chip ${BAND_CHIP[match.band]}`}>{BAND_LABEL[match.band]}</span>
            </div>
            <div className="rings">
              <ScoreRing percent={match.percent} label="Overall" note="must ×3 · nice ×1" color="var(--color-brand)" />
              <ScoreRing percent={match.mustPercent} label="Must-have" note={countLine('must')} color="var(--color-info)" />
              <ScoreRing percent={match.nicePercent} label="Nice-to-have" note={countLine('nice')} color="var(--color-positive)" />
            </div>
            {match.mustPercent < 50 && must.length > 0 && (
              <div className="notice notice-caution">Under half of the must-haves are covered. You can still continue — the next step is where this number moves.</div>
            )}
            {analysis.overallNotes && <div className="summary-box"><strong>In short:</strong> {analysis.overallNotes}</div>}
          </section>

          <RequirementList title={`Must-have (${must.length})`} items={must} accepted={accepted} legend />
          <RequirementList title={`Nice-to-have (${nice.length})`} items={nice} accepted={accepted} />

          {analysis.standardRequirements.length > 0 && (
            <section className="card">
              <div className="card-head-row">
                <div className="row">
                  <span className="chip chip-standard">Not scored</span>
                  <h4>Usually expected for this role, but not in this posting</h4>
                </div>
                <button type="button" className="link" onClick={() => setShowStandard((v) => !v)}>{showStandard ? 'Hide' : 'Show'}</button>
              </div>
              {showStandard && (
                <>
                  <p className="small">General knowledge about the role — worth knowing before the interview, never counted in your match.</p>
                  <div className="row">
                    {analysis.standardRequirements.map((s, i) => (
                      <span className="chip chip-outline" key={i} title={s.note}>
                        {s.requirement} · <b style={{ marginLeft: 4, color: s.status === 'covered' ? 'var(--color-positive)' : s.status === 'partial' ? 'var(--color-caution-ink)' : 'var(--color-critical)' }}>{s.status}</b>
                      </span>
                    ))}
                  </div>
                </>
              )}
            </section>
          )}

          <div className="row">
            <button type="button" className="btn btn-primary" onClick={() => goTo(3)}>
              Continue to Tailor & build{gaps ? ` · ${gaps} gap${gaps === 1 ? '' : 's'}` : ''}
            </button>
          </div>
        </>
      )}
    </>
  );
}

function RequirementList({ title, items, accepted, legend }: { title: string; items: { r: Requirement; i: number }[]; accepted: Set<number>; legend?: boolean }) {
  return (
    <section className="card" style={{ gap: 0 }}>
      <div className="card-head-row" style={{ paddingBottom: 12 }}>
        <h3>{title}</h3>
        {legend && (
          <div className="legend">
            <span className="chip-covered">Covered</span><span className="chip-partial">Partial</span><span className="chip-missing">Missing</span>
          </div>
        )}
      </div>
      {items.length === 0 && <p className="small">None found in the posting.</p>}
      <Cascade>
      {items.map(({ r, i }) => {
        const status = accepted.has(i) ? 'covered' : r.status;
        return (
          <div className="req" key={i}>
            <StatusChip status={status} fixed />
            <div className="req-body">
              <div className="req-title">{r.requirement}</div>
              {status === 'covered' && (accepted.has(i) ? <div className="small">Closed by you in step 3</div> : r.coveredIn && <div className="small">{r.coveredIn}</div>)}
              {status !== 'covered' && r.equivalent && (
                <div className="req-note partial"><b>Equivalent you have:</b><span>{r.equivalent.yourSkill} — {r.equivalent.note}</span></div>
              )}
              {status !== 'covered' && r.learnSuggestion && (
                <div className={`req-note ${r.status}`}><b>{r.status === 'missing' ? 'Learn:' : 'To strengthen:'}</b><span>{r.learnSuggestion}</span></div>
              )}
              {status !== 'covered' && r.clarifyingQuestion && (
                <div className="req-note question"><b>Question for the next step:</b><span>{r.clarifyingQuestion}</span></div>
              )}
            </div>
          </div>
        );
      })}
      </Cascade>
    </section>
  );
}
