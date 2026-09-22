import { useMemo, useState } from 'react';
import { PromptExchange } from '../components/PromptExchange';
import { StatusChip } from '../components/bits';
import { AnimatedNumber } from '../components/motion';
import { CvDocument } from '../cv/CvDocument';
import { buildCv, cvWithIds, draftBullet, type BuildCvReply, type DraftBulletReply } from '../exchanges';
import { newId } from '../lib/ids';
import { computeMatch } from '../lib/score';
import { useT } from '../lib/i18n/useT';
import FuseButton from '../reactbits/FuseButton/FuseButton';
import HoldButton from '../reactbits/HoldButton/HoldButton';
import type { AppState } from '../state/useAppState';
import type { Cv } from '../types/cv';
import type { Requirement } from '../types/jobFit';

interface Variant { text: string; whatChanged: string }

/** What an Accept wrote to the CV, so Undo can take exactly that back. */
type Written =
  | { kind: 'bullet'; experienceId: string; bulletId: string }
  | { kind: 'skill'; groupId: string; item: string; createdGroup: boolean };

const UNDO_WINDOW = 4000;

export function TailorBuildStep(state: AppState) {
  const { cv, setCv, session, patchSession, goTo } = state;
  const t = useT();
  const analysis = session.analysis;

  // --- gap-closing (from UpdateStep) ---
  const [drafts, setDrafts] = useState<Record<number, { variants: Variant[]; missingInfo: string | null }>>({});
  const [open, setOpen] = useState<number | null>(null);
  const [skipped, setSkipped] = useState<Set<number>>(new Set());
  /** Gaps whose Accept is still inside its undo window — they stay open until the fuse burns out. */
  const [armed, setArmed] = useState<Set<number>>(new Set());
  const [written, setWritten] = useState<Record<number, Written>>({});
  const [lastAdded, setLastAdded] = useState<{ index: number; text: string } | null>(null);

  // --- build & export (from BuildStep) ---
  const [toast, setToast] = useState<string | null>(null);

  if (!analysis) {
    return <section className="card"><h2>3 · Tailor & build</h2><p className="hint">{t('steps.gate.needComparison')}</p></section>;
  }

  const accepted = new Set(session.accepted);
  const allGaps = analysis.requirements.map((r, i) => ({ r, i })).filter(({ r }) => r.status !== 'covered');
  const gaps = allGaps.filter(({ i }) => !accepted.has(i) || armed.has(i));
  const closedGaps = allGaps.filter(({ i }) => accepted.has(i) && !armed.has(i));
  const closed = allGaps.filter(({ i }) => accepted.has(i)).length;
  const totalGaps = allGaps.length;
  const match = computeMatch(analysis.requirements, accepted);
  const baseline = computeMatch(analysis.requirements);

  const setIn = (set: Set<number>, index: number, on: boolean) => {
    const next = new Set(set);
    if (on) next.add(index); else next.delete(index);
    return next;
  };

  const markAccepted = (index: number, w: Written, message: string) => {
    patchSession((prev) => ({ accepted: [...new Set([...prev.accepted, index])] }));
    setArmed((s) => setIn(s, index, true));
    setWritten((m) => ({ ...m, [index]: w }));
    setLastAdded({ index, text: message });
  };

  const settle = (index: number) => {
    setArmed((s) => setIn(s, index, false));
    setOpen(null);
  };

  const undo = (index: number) => {
    const w = written[index];
    if (w) {
      const next: Cv = w.kind === 'bullet'
        ? { ...cv, experience: cv.experience.map((x) => (x.id === w.experienceId ? { ...x, bullets: x.bullets.filter((b) => b.id !== w.bulletId) } : x)) }
        : {
          ...cv,
          skills: w.createdGroup
            ? cv.skills.filter((g) => g.id !== w.groupId)
            : cv.skills.map((g) => (g.id === w.groupId ? { ...g, items: g.items.filter((it) => it !== w.item) } : g)),
        };
      setCv(next);
    }
    patchSession((prev) => ({ accepted: prev.accepted.filter((i) => i !== index) }));
    setArmed((s) => setIn(s, index, false));
    setLastAdded(null);
  };

  const reopen = (index: number) => {
    patchSession((prev) => ({ accepted: prev.accepted.filter((i) => i !== index) }));
    setOpen(index);
    setLastAdded(null);
  };

  const setAnswer = (index: number, answer: string) => patchSession((prev) => ({ answers: { ...prev.answers, [String(index)]: answer } }));

  const addSkill = (index: number, req: Requirement, groupId: string) => {
    const skillName = req.skill.trim() || req.requirement;
    if (groupId === '__new__') {
      const id = newId('sk');
      setCv({ ...cv, skills: [...cv.skills, { id, label: 'Skills', items: [skillName] }] });
      markAccepted(index, { kind: 'skill', groupId: id, item: skillName, createdGroup: true }, `Added "${skillName}" to Skills.`);
      return;
    }
    const group = cv.skills.find((g) => g.id === groupId);
    const already = group?.items.includes(skillName) ?? false;
    if (!already) setCv({ ...cv, skills: cv.skills.map((g) => (g.id === groupId ? { ...g, items: [...g.items, skillName] } : g)) });
    markAccepted(index, { kind: 'skill', groupId, item: already ? '' : skillName, createdGroup: false }, `Added "${skillName}" to Skills.`);
  };

  const acceptBullet = (index: number, experienceId: string, text: string) => {
    const bulletId = newId('b');
    setCv({
      ...cv,
      experience: cv.experience.map((x) => (x.id === experienceId ? { ...x, bullets: [...x.bullets, { id: bulletId, text }] } : x)),
    });
    const role = cv.experience.find((x) => x.id === experienceId);
    markAccepted(index, { kind: 'bullet', experienceId, bulletId }, `Added a bullet under ${role?.role || role?.organization || 'the role'}.`);
  };

  // --- build & export ---
  const shown: Cv = session.builtCv ?? cv;
  const buildInput = useMemo(() => ({
    cv,
    jobDescription: session.jd,
    roleTitle: analysis.roleTitle || session.jobTitle,
    emphasisNotes: analysis.emphasisNotes ?? [],
  }), [cv, session.jd, session.jobTitle, analysis]);

  const applyBuild = (reply: BuildCvReply) => {
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
        <div className="card-head">
          <h2>3 · Tailor & build</h2>
          <p className="hint">{t('steps.tailorBuild.introHint')}</p>
        </div>
        <div className="row">
          <span className="chip chip-info">Match {baseline.percent}% → <AnimatedNumber value={match.percent} />%</span>
          <span className="small">{closed} of {totalGaps} gaps closed · unanswered gaps stay as they are</span>
        </div>
      </section>

      {lastAdded && (
        <div className="notice notice-positive no-print" role="status">
          <span>{lastAdded.text} Match is now {match.percent}%.</span>
        </div>
      )}

      <div className="tailor-grid no-print">
        <div className="stack">
          {gaps.length === 0 && <section className="card"><p className="hint">{t('steps.tailorBuild.noGapsLeft')}</p></section>}

          {closedGaps.map(({ r, i }) => (
            <section className="card" key={`closed-${i}`} style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
              <span className="chip chip-covered">Closed · {r.priority}</span>
              <strong>{r.requirement}</strong>
              <span className="small" style={{ flex: 1, minWidth: 160 }}>{t('steps.tailorBuild.closedNote')}</span>
              <button type="button" className="link" onClick={() => reopen(i)}>Reopen</button>
            </section>
          ))}

          {gaps.map(({ r, i }) => {
            const answer = session.answers[String(i)] ?? '';
            const draft = drafts[i];
            const isArmed = armed.has(i);
            const isOpen = isArmed || open === i || (open === null && gaps[0]?.i === i);
            if (skipped.has(i) || !isOpen) {
              return (
                <section className="card" key={i} style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                  <StatusChip status={r.status} priority={r.priority} />
                  <strong>{r.requirement}</strong>
                  <span className="small" style={{ flex: 1, minWidth: 160 }}>{r.clarifyingQuestion}</span>
                  <button type="button" className="link" onClick={() => { setOpen(i); setSkipped((s) => setIn(s, i, false)); }}>
                    {skipped.has(i) ? 'Skipped — reopen' : 'Answer'}
                  </button>
                </section>
              );
            }
            return (
              <section className="card" key={i}>
                <div className="gap-head">
                  <StatusChip status={r.status} priority={r.priority} />
                  <div className="stack" style={{ gap: 4 }}>
                    <h4>{r.requirement}</h4>
                    <p>{r.clarifyingQuestion ?? 'Do you have this? Describe where and how.'}</p>
                    {r.equivalent && <p className="small"><b style={{ color: 'var(--color-caution-ink)' }}>You already have:</b> {r.equivalent.yourSkill} — {r.equivalent.note}</p>}
                  </div>
                </div>
                <textarea rows={3} value={answer} onChange={(e) => setAnswer(i, e.target.value)} placeholder={t('steps.tailorBuild.answerPlaceholder')} />
                <div className="row">
                  <AddSkillControl
                    groups={cv.skills} skill={r.skill || r.requirement} disabled={isArmed}
                    onAdd={(gid) => addSkill(i, r, gid)} onUndo={() => undo(i)} onFuseEnd={() => settle(i)}
                  />
                  {!isArmed && (
                    <button type="button" className="btn btn-quiet" onClick={() => { setSkipped((s) => setIn(s, i, true)); setOpen(gaps.find((g) => g.i !== i)?.i ?? null); }}>I don't — skip</button>
                  )}
                </div>
                <PromptExchange
                  exchange={draftBullet}
                  input={{ requirement: r.requirement, answer, role: cv.experience[0]?.role ?? '', organization: cv.experience[0]?.organization ?? '' }}
                  title="Draft a bullet from my answer"
                  disabled={!answer.trim()} disabledReason="Write an answer first."
                  applied={draft ? `${draft.variants.length} variant${draft.variants.length === 1 ? '' : 's'} drafted` : null}
                  onResult={(reply: DraftBulletReply) => setDrafts((d) => ({ ...d, [i]: { variants: reply.variants, missingInfo: reply.missingInfoPrompt } }))}
                />
                {draft && (
                  <div className="stack">
                    {draft.missingInfo && <div className="notice notice-caution">{draft.missingInfo}</div>}
                    {draft.variants.map((v, vi) => (
                      <VariantCard
                        key={vi} variant={v} experience={cv.experience} locked={isArmed || accepted.has(i)}
                        onAccept={(xid, text) => acceptBullet(i, xid, text)} onUndo={() => undo(i)} onFuseEnd={() => settle(i)}
                      />
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>

        <div className="stack tailor-preview">
          <section className="card">
            <div className="card-head-row">
              <div className="card-head">
                <h3>Your CV for this job</h3>
                <p className="hint">{t('steps.tailorBuild.previewExplainer')}</p>
              </div>
              <div className="row">
                <span className="chip chip-info">Match {match.percent}%</span>
                <button type="button" className="btn btn-primary" onClick={() => window.print()}>Export PDF</button>
              </div>
            </div>
            <PromptExchange
              exchange={buildCv} input={buildInput} title="Build the CV for this job"
              disabled={!session.jd.trim()} disabledReason="Paste a job description in step 2 first."
              applied={session.builtCv ? `Applied · ${session.changes.length} changes` : null}
              onResult={applyBuild}
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
              </div>
            )}
            {session.changes.length > 0 && (
              <div className="stack divider-top">
                <h4>What changed for this job</h4>
                <ol style={{ margin: 0, paddingLeft: 20 }} className="stack">
                  {session.changes.map((c, i) => <li key={i}>{c}</li>)}
                </ol>
                <p className="small">{t('steps.tailorBuild.noFactsChangedNote')}</p>
              </div>
            )}
          </section>
          <CvDocument cv={shown} onEditBullet={editBullet} />
        </div>
      </div>

      <div className="print-only">
        <CvDocument cv={shown} onEditBullet={editBullet} />
      </div>

      <div className="row no-print">
        <button type="button" className="btn btn-primary" onClick={() => goTo(4)}>Continue to Interview prep</button>
        <button type="button" className="btn btn-secondary" onClick={() => goTo(2)}>Back to Job & match</button>
        <span className="small">{t('steps.tailorBuild.placeholdersNote')}</span>
      </div>
      {toast && <div className="toast" role="status">{toast}</div>}
    </>
  );
}

interface FuseHandlers { onUndo: () => void; onFuseEnd: () => void }

function AddSkillControl({ groups, skill, disabled, onAdd, onUndo, onFuseEnd }: { groups: { id: string; label: string }[]; skill: string; disabled: boolean; onAdd: (groupId: string) => void } & FuseHandlers) {
  const [group, setGroup] = useState(groups[0]?.id ?? '__new__');
  return (
    <div className="row" style={{ gap: 8 }}>
      <select value={group} aria-label="Skill group" disabled={disabled} onChange={(e) => setGroup(e.target.value)} style={{ width: 'auto', height: 44 }}>
        {groups.map((g) => <option key={g.id} value={g.id}>{g.label || 'Skills'}</option>)}
        <option value="__new__">New skills group</option>
      </select>
      <FuseButton
        label={`I have this — add "${skill}"`} doneLabel="Added to Skills" undoLabel="Undo"
        className="fb-outline" background="var(--color-card)" color="var(--color-brand)" fuseColor="var(--color-brand)"
        radius={8} undoWindow={UNDO_WINDOW} settle="stay" commitOn="press"
        onCommit={() => onAdd(group)} onUndo={onUndo} onFuseEnd={onFuseEnd}
      />
    </div>
  );
}

function VariantCard({ variant, experience, locked, onAccept, onUndo, onFuseEnd }: { variant: Variant; experience: { id: string; role: string; organization: string }[]; locked: boolean; onAccept: (experienceId: string, text: string) => void } & FuseHandlers) {
  const [target, setTarget] = useState('');
  const [text, setText] = useState(variant.text);
  const [committed, setCommitted] = useState(false);
  const frozen = committed || locked;
  return (
    <div className="variant">
      <textarea rows={2} value={text} onChange={(e) => setText(e.target.value)} className="variant-text" disabled={frozen} />
      <div className="small">{variant.whatChanged}</div>
      <div className="row">
        <select value={target} aria-label="Add under" disabled={frozen} onChange={(e) => setTarget(e.target.value)}>
          <option value="">Choose where to add it…</option>
          {experience.map((x) => <option key={x.id} value={x.id}>{x.role || 'Role'} — {x.organization || 'Untitled'}</option>)}
        </select>
        <FuseButton
          label="Accept" doneLabel="Added to your CV" undoLabel="Undo" size="sm"
          background="var(--color-brand)" color="#ffffff" fuseColor="#ffffff"
          radius={8} undoWindow={UNDO_WINDOW} settle="stay" commitOn="press"
          disabled={!target || !text.trim() || (locked && !committed)}
          onCommit={() => { setCommitted(true); onAccept(target, text.trim()); }}
          onUndo={() => { setCommitted(false); onUndo(); }}
          onFuseEnd={onFuseEnd}
        />
      </div>
    </div>
  );
}
