import type { Cv } from '../types/cv';

/** The flattened, reading-order form of the CV that every prompt receives. */
export function cvToText(cv: Cv): string {
  const lines: string[] = [];
  const b = cv.basics;
  lines.push([b.fullName, b.location, b.email, b.phone].filter(Boolean).join(' · '));
  for (const link of b.links) lines.push(`${link.label}: ${link.url}`);
  if (cv.summary.trim()) lines.push('', 'SUMMARY', cv.summary.trim());

  if (cv.education.length) {
    lines.push('', 'EDUCATION');
    for (const e of cv.education) {
      lines.push([e.institution, e.location].filter(Boolean).join(', ') + dateSpan(e.start, e.end));
      lines.push([e.degree, e.field].filter(Boolean).join(' in '));
      if (e.detail.trim()) lines.push(e.detail.trim());
    }
  }

  if (cv.experience.length) {
    lines.push('', 'EXPERIENCE');
    for (const x of cv.experience) {
      lines.push([x.organization, x.location].filter(Boolean).join(', ') + dateSpan(x.start, x.end));
      if (x.role) lines.push(x.role);
      for (const bullet of x.bullets) if (bullet.text.trim()) lines.push(`- ${bullet.text.trim()}`);
    }
  }

  if (cv.skills.length) {
    lines.push('', 'SKILLS');
    for (const g of cv.skills) lines.push(`${g.label}: ${g.items.join(', ')}`);
  }

  for (const extra of cv.extras) {
    if (!extra.items.length) continue;
    lines.push('', extra.title.toUpperCase());
    for (const item of extra.items) lines.push(`- ${item}`);
  }

  return lines.join('\n').trim();
}

function dateSpan(start: string, end: string): string {
  const span = [start, end].filter(Boolean).join(' – ');
  return span ? ` (${span})` : '';
}
