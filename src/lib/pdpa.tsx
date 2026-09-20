/**
 * Draft PDPA (Thailand Personal Data Protection Act) notice copy.
 * This is placeholder text, not legal advice — have it reviewed by counsel
 * before relying on it in production.
 */
export const PDPA_CONSENT_VERSION = '2026-09-20';

export function PdpaNotice() {
  return (
    <div className="pdpa-notice">
      <h2>How we use your data</h2>
      <p>
        Job Fit CV helps you build a CV tailored to a specific job. To do that,
        we collect and store the following personal data in your account,
        under your control:
      </p>

      <h3>What we collect</h3>
      <ul>
        <li><strong>Identity &amp; contact</strong> — full name, email, phone, location, and any profile links you add.</li>
        <li><strong>Education history</strong> — institutions, degrees, dates, and honors you enter.</li>
        <li><strong>Work history</strong> — employers, roles, dates, and the bullet points describing your work.</li>
        <li><strong>Skills</strong> — skills you list, self-assessed levels, years of experience, and supporting notes.</li>
        <li><strong>Survey answers</strong> — anything you tell us about your skills through the profile survey.</li>
        <li><strong>Job postings you paste</strong> — the text of job descriptions you compare yourself against.</li>
        <li><strong>Generated content</strong> — match analysis, tailored CV drafts, interview prep questions, and your reflections on them.</li>
        <li><strong>Account &amp; consent record</strong> — your account identity, timestamps, and a record of this consent.</li>
      </ul>

      <h3>Why we collect it</h3>
      <p>
        Solely to generate your CV, compare it against jobs you choose, and
        prepare you for interviews. We do not sell your data or share it with
        third parties for marketing.
      </p>

      <h3>Where it's stored</h3>
      <p>
        Your data is stored in our database with row-level security, meaning
        only your account can read or write your own records.
      </p>

      <h3>How long we keep it</h3>
      <p>
        We keep your data while your account is active. Deleting your account
        permanently deletes this data.
      </p>

      <h3>Your rights</h3>
      <p>
        Under Thailand's Personal Data Protection Act (PDPA), you have the
        right to access, correct, or delete your personal data, and to
        withdraw this consent at any time. To exercise these rights, contact
        us at <strong>privacy@jobfitcv.example</strong> (placeholder — update
        before launch).
      </p>
    </div>
  );
}
