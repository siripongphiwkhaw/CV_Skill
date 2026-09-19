import type { Cv } from '../types/cv';

interface Props {
  cv: Cv;
  /** Bullet ids to highlight as newly added. */
  newBulletIds?: Set<string>;
  /** When given, bullets become editable in place. */
  onEditBullet?: (experienceId: string, bulletId: string, text: string) => void;
}

function span(start: string, end: string): string {
  return [start, end].filter(Boolean).join(' – ');
}

export function CvDocument({ cv, newBulletIds, onEditBullet }: Props) {
  const b = cv.basics;
  const contact = [b.location, b.email, b.phone].filter(Boolean).join(' · ');
  const hasAnything = b.fullName || cv.experience.length || cv.education.length || cv.skills.length;

  if (!hasAnything) {
    return <article className="cv-page"><div className="cv-empty">Your CV will appear here once it is imported in step 1.</div></article>;
  }

  return (
    <article className="cv-page">
      <header className="cv-header">
        <div className="cv-name">{b.fullName || '[Your name]'}</div>
        {contact && <div>{contact}</div>}
        {b.links.length > 0 && <div>{b.links.map((l) => l.url || l.label).filter(Boolean).join(' · ')}</div>}
      </header>

      {cv.summary.trim() && (
        <section className="cv-section">
          <div className="cv-section-title">Summary</div>
          <p>{cv.summary}</p>
        </section>
      )}

      {cv.education.length > 0 && (
        <section className="cv-section">
          <div className="cv-section-title">Education</div>
          {cv.education.map((e) => (
            <div key={e.id}>
              <div className="cv-entry-head"><span><strong>{e.institution}</strong>{e.location ? `, ${e.location}` : ''}</span><span>{span(e.start, e.end)}</span></div>
              <div>{[e.degree, e.field].filter(Boolean).join(' in ')}{e.detail ? ` — ${e.detail}` : ''}</div>
            </div>
          ))}
        </section>
      )}

      {cv.experience.length > 0 && (
        <section className="cv-section">
          <div className="cv-section-title">Professional Experience</div>
          {cv.experience.map((x) => (
            <div key={x.id}>
              <div className="cv-entry-head"><span><strong>{x.organization}</strong>{x.location ? `, ${x.location}` : ''}</span><span>{span(x.start, x.end)}</span></div>
              {x.role && <div>{x.role}</div>}
              {x.bullets.length > 0 && (
                <ul className="cv-bullets">
                  {x.bullets.map((bl) => (
                    <li
                      key={bl.id}
                      className={newBulletIds?.has(bl.id) ? 'is-new' : undefined}
                      contentEditable={onEditBullet ? 'plaintext-only' : undefined}
                      suppressContentEditableWarning
                      onBlur={onEditBullet ? (e) => onEditBullet(x.id, bl.id, e.currentTarget.textContent ?? '') : undefined}
                    >
                      {bl.text}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {cv.extras.filter((x) => x.items.length).map((x) => (
        <section className="cv-section" key={x.id}>
          <div className="cv-section-title">{x.title}</div>
          {x.items.map((item, i) => <div key={i}>{item}</div>)}
        </section>
      ))}

      {cv.skills.length > 0 && (
        <section className="cv-section">
          <div className="cv-section-title">Skills</div>
          {cv.skills.map((g) => (
            <div className="cv-skill-line" key={g.id}><strong>{g.label}:</strong> {g.items.join(', ')}</div>
          ))}
        </section>
      )}
    </article>
  );
}
