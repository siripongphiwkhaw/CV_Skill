import { useMemo, useState } from 'react';
import { PromptExchange } from '../components/PromptExchange';
import { cvWithIds, extractSkills, importCv, type CvReply, type ExtractSkillsReply } from '../exchanges';
import { cvToText } from '../lib/cvText';
import { newId } from '../lib/ids';
import { SKILL_CATEGORIES, type SkillEntry, type SkillLevel } from '../types/profile';
import { cvHasContent, type AppState } from '../state/useAppState';
import RubberSegment from '../reactbits/RubberSegment/RubberSegment';

const CATEGORY_LABEL: Record<SkillEntry['category'], string> = {
  technical: 'Technical', tool: 'Tool', domain: 'Domain', soft: 'Soft', language: 'Language', certification: 'Certification',
};

const LEVEL_ITEMS = [{ value: 'none', label: '–' }, '1', '2', '3', '4', '5'];

export function ProfileStep({ cv, setCv, profile, setProfile, goTo }: AppState) {
  const [pasted, setPasted] = useState('');
  const [reimport, setReimport] = useState(false);
  const imported = cvHasContent(cv);
  const cvText = useMemo(() => (pasted.trim() ? pasted : cvToText(cv)), [pasted, cv]);

  const applyImport = (reply: CvReply) => {
    setCv(cvWithIds(reply));
    setReimport(false);
  };

  const applySkills = (reply: ExtractSkillsReply) => {
    setProfile((prev) => {
      const byName = new Map(prev.skills.map((s) => [s.name.toLowerCase(), s]));
      const skills: SkillEntry[] = reply.skills.map((s) => {
        const existing = byName.get(s.name.toLowerCase());
        return {
          id: existing?.id ?? newId('skill'),
          name: s.name,
          category: s.category,
          level: existing?.level ?? ((s.inferredLevel as SkillLevel | null) ?? null),
          years: existing?.years ?? null,
          evidence: s.evidence,
          source: 'cv',
        };
      });
      const manual = prev.skills.filter((s) => s.source === 'manual' && !reply.skills.some((r) => r.name.toLowerCase() === s.name.toLowerCase()));
      const prevAnswers = new Map(prev.surveyAnswers.map((a) => [a.question, a.answer]));
      return {
        skills: [...skills, ...manual],
        surveyAnswers: reply.followUpQuestions.map((q) => ({ question: q, answer: prevAnswers.get(q) ?? '' })),
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const patchSkill = (id: string, patch: Partial<SkillEntry>) =>
    setProfile((p) => ({ ...p, skills: p.skills.map((s) => (s.id === id ? { ...s, ...patch } : s)), updatedAt: new Date().toISOString() }));
  const removeSkill = (id: string) =>
    setProfile((p) => ({ ...p, skills: p.skills.filter((s) => s.id !== id), updatedAt: new Date().toISOString() }));
  const addSkill = () =>
    setProfile((p) => ({
      ...p,
      skills: [...p.skills, { id: newId('skill'), name: '', category: 'technical', level: null, years: null, evidence: null, source: 'manual' }],
      updatedAt: new Date().toISOString(),
    }));
  const setAnswer = (i: number, answer: string) =>
    setProfile((p) => ({ ...p, surveyAnswers: p.surveyAnswers.map((a, j) => (j === i ? { ...a, answer } : a)), updatedAt: new Date().toISOString() }));

  const canContinue = profile.skills.some((s) => s.name.trim());
  const importSummary = imported
    ? `Applied · ${cv.experience.length} role${cv.experience.length === 1 ? '' : 's'}, ${cv.education.length} degree${cv.education.length === 1 ? '' : 's'}, ${cv.skills.reduce((n, g) => n + g.items.length, 0)} listed skills`
    : null;

  return (
    <>
      <section className="card">
        <div className="card-head">
          <h2>1 · Your skill profile</h2>
          <p className="hint">Paste your current CV once. It is turned into a structured document and a skill list you can rate. Saved in this browser only.</p>
        </div>

        {imported && !reimport ? (
          <div className="notice notice-positive">
            <span>Imported: {cv.basics.fullName || 'unnamed'} — {cv.experience.length} roles, {cv.education.length} degrees.</span>
            <button type="button" className="link" onClick={() => setReimport(true)}>Paste a different CV</button>
          </div>
        ) : (
          <label className="field">
            <span>Your current CV (plain text)</span>
            <textarea rows={8} value={pasted} onChange={(e) => setPasted(e.target.value)} placeholder="Paste everything — name, contact, experience, education, skills…" />
          </label>
        )}

        <PromptExchange
          exchange={importCv} input={{ cvText }} title="Import CV"
          disabled={!cvText.trim()} disabledReason="Paste your CV first."
          applied={importSummary} onResult={applyImport}
        />
        <PromptExchange
          exchange={extractSkills} input={{ cvText }} title="Extract skills"
          disabled={!cvText.trim()} disabledReason="Paste or import your CV first."
          applied={profile.skills.length ? `Applied · ${profile.skills.length} skills, ${profile.surveyAnswers.length} questions` : null}
          onResult={applySkills}
        />
      </section>

      <section className="card">
        <div className="card-head-row">
          <div className="card-head">
            <h3>Your skills ({profile.skills.length})</h3>
            <p className="hint">Rate yourself honestly — this is what the job comparison uses. Evidence is quoted from your CV, never invented.</p>
          </div>
          <button type="button" className="btn btn-secondary btn-sm" onClick={addSkill}>+ Add a skill</button>
        </div>

        {profile.skills.length > 0 && (
          <div>
            <div className="skills-grid head label">
              <div>Skill</div><div>Category</div><div>Level (1–5)</div><div>Years</div><div>Evidence from your CV</div><div />
            </div>
            {profile.skills.map((s) => (
              <div className="skills-grid" key={s.id}>
                <input type="text" value={s.name} aria-label="Skill name" placeholder="Skill" onChange={(e) => patchSkill(s.id, { name: e.target.value })} />
                <select value={s.category} aria-label="Category" onChange={(e) => patchSkill(s.id, { category: e.target.value as SkillEntry['category'] })}>
                  {SKILL_CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}
                </select>
                <div className="level-cell">
                  <RubberSegment
                    items={LEVEL_ITEMS}
                    value={s.level ? String(s.level) : 'none'}
                    onChange={(v) => patchSkill(s.id, { level: v === 'none' ? null : (Number(v) as SkillLevel) })}
                    size="sm" radius={8} inset={2} glide={40}
                    trackColor="var(--color-chip-neutral)" thumbColor="var(--color-brand)"
                    textColor="var(--color-ink-2)" activeTextColor="#ffffff"
                    aria-label={`Level for ${s.name || 'skill'}`}
                  />
                </div>
                <input
                  type="number" min={0} step={0.5} value={s.years ?? ''} aria-label="Years" placeholder="yrs"
                  onChange={(e) => patchSkill(s.id, { years: e.target.value === '' ? null : Number(e.target.value) })}
                />
                <div className="evidence">{s.evidence ? `“${s.evidence}”` : s.source === 'manual' ? 'Added by you' : 'Listed by name only'}</div>
                <button type="button" className="icon-btn" aria-label={`Remove ${s.name || 'skill'}`} onClick={() => removeSkill(s.id)}>×</button>
              </div>
            ))}
          </div>
        )}
        {profile.skills.length === 0 && <p className="small">No skills yet — run the "Extract skills" exchange above, or add them by hand.</p>}
      </section>

      <section className="card">
        <div className="card-head">
          <h3>A few follow-up questions ({profile.surveyAnswers.length})</h3>
          <p className="hint">Things your CV implies but does not say. Skip any you like — unanswered ones are simply not used.</p>
        </div>
        {profile.surveyAnswers.map((a, i) => (
          <label className="field" key={i}>
            <span>{a.question}</span>
            <textarea rows={2} value={a.answer} placeholder="Your answer…" onChange={(e) => setAnswer(i, e.target.value)} />
          </label>
        ))}
        {profile.surveyAnswers.length === 0 && <p className="small">Questions appear here after the skills exchange.</p>}
        <div className="row divider-top">
          <button type="button" className="btn btn-primary" disabled={!canContinue} onClick={() => goTo(2)}>Save profile &amp; continue</button>
          <span className="small">Everything here autosaves. You can come back and re-rate any time.</span>
        </div>
      </section>
    </>
  );
}
