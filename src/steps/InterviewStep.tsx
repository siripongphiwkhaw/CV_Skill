import { useMemo } from 'react';
import { PromptExchange } from '../components/PromptExchange';
import { Cascade } from '../components/motion';
import { interviewPrep, type InterviewPrepReply } from '../exchanges';
import { cvToText } from '../lib/cvText';
import { computeMatch } from '../lib/score';
import HoldButton from '../reactbits/HoldButton/HoldButton';
import JellyRadio from '../reactbits/JellyRadio/JellyRadio';
import type { AppState } from '../state/useAppState';

const KIND_CHIP = { behavioral: 'chip-info', technical: 'chip-standard', case: 'chip-partial' } as const;
const KIND_LABEL = { behavioral: 'Behavioral', technical: 'Technical', case: 'Case' } as const;
const OPTIONS = [{ value: 'none', label: 'Not yet' }, 'Yes', 'Unsure', 'No'];

export function InterviewStep({ cv, session, patchSession, goTo, startAnotherJob }: AppState) {
  const analysis = session.analysis;
  const reflections = session.reflections ?? {};

  const input = useMemo(() => {
    if (!analysis) return null;
    const accepted = new Set(session.accepted);
    const match = computeMatch(analysis.requirements, accepted);
    const lines = analysis.requirements.map((r, i) => {
      const status = accepted.has(i) ? 'covered (closed by candidate)' : r.status;
      return `- [${r.priority}] ${r.requirement}: ${status}${r.equivalent ? ` (has ${r.equivalent.yourSkill})` : ''}`;
    });
    return {
      cvText: cvToText(session.builtCv ?? cv),
      jobDescription: session.jd,
      roleTitle: analysis.roleTitle || session.jobTitle,
      requirementSummary: `Match ${match.percent}% (must-have ${match.mustPercent}%).\n${lines.join('\n')}\n\n${analysis.overallNotes}`,
    };
  }, [analysis, cv, session]);

  if (!analysis || !input) {
    return <section className="card"><h2>4 · Interview</h2><p className="hint">Run the comparison in step 2 first.</p></section>;
  }

  const pack = session.interview;
  const setReflection = (i: number, value: string) =>
    patchSession((prev) => ({ reflections: { ...(prev.reflections ?? {}), [String(i)]: value } }));

  return (
    <>
      <section className="card">
        <div className="card-head">
          <h2>4 · Interview prep and a fit check</h2>
          <p className="hint">Questions this posting is likely to produce, each with a hint pointing at something already on your CV. Then what the job is actually like — so you can decide if you want it.</p>
        </div>
        <PromptExchange
          exchange={interviewPrep} input={input} title="Interview prep"
          applied={pack ? `Applied · ${pack.questions.length} questions, ${pack.scenarios.length} scenarios` : null}
          onResult={(reply: InterviewPrepReply) => patchSession({ interview: reply })}
        />
      </section>

      {pack && (
        <>
          <section className="card" style={{ gap: 0 }}>
            <h3 style={{ paddingBottom: 8 }}>Likely questions ({pack.questions.length})</h3>
            <Cascade>
              {pack.questions.map((q, i) => (
                <div className="req" key={i}>
                  <span className={`chip ${KIND_CHIP[q.kind]} chip-fixed`} style={{ width: 84 }}>{KIND_LABEL[q.kind]}</span>
                  <div className="req-body">
                    <div className="req-title">{q.question}</div>
                    <div className="req-note"><b style={{ color: 'var(--color-positive)' }}>From your CV:</b><span>{q.hintFromCv}</span></div>
                  </div>
                </div>
              ))}
            </Cascade>
          </section>

          <section className="card">
            <div className="card-head">
              <h3>A week in this job</h3>
              <p className="hint">Three realistic scenarios drawn from the posting's responsibilities.</p>
            </div>
            <div className="scenarios">
              {pack.scenarios.map((s, i) => (
                <div className="scenario" key={i}>
                  <div className="scenario-title">{s.title}</div>
                  <p className="small" style={{ color: 'var(--color-ink)' }}>{s.description}</p>
                  <div className="row" style={{ gap: 4 }}>{s.skillsUsed.map((k) => <span className="tag" key={k}>{k}</span>)}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="card">
            <div className="card-head">
              <h3>Do you actually want this?</h3>
              <p className="hint">Three honest prompts. Nothing is scored — this is for you.</p>
            </div>
            {pack.reflectionPrompts.map((p, i) => (
              <div className="reflect" key={i}>
                <p>{p}</p>
                <JellyRadio
                  items={OPTIONS} value={reflections[String(i)] ?? 'none'} onChange={(v) => setReflection(i, v)}
                  size="sm" radius={9999} gap={6} swell={0.14} barge={4}
                  chipColor="var(--color-card)" activeColor="var(--color-brand)"
                  textColor="var(--color-ink)" activeTextColor="#ffffff"
                  ariaLabel={`Answer ${i + 1}`} className="reflect-radio"
                />
              </div>
            ))}
          </section>
        </>
      )}

      <div className="row">
        <HoldButton
          radius={8} holdTime={1000} glow={false} resetAfter={0} className="hb-outline"
          backgroundColor="var(--color-card)" fillColor="var(--color-brand)" textColor="var(--color-brand)" fillTextColor="#ffffff"
          doneLabel="Starting…" onHold={startAnotherJob}
        >
          Hold to start another job
        </HoldButton>
        <button type="button" className="btn btn-secondary" onClick={() => goTo(3)}>Back to Tailor & build</button>
        <span className="small">Your profile and CV stay; only the job session resets.</span>
      </div>
    </>
  );
}
