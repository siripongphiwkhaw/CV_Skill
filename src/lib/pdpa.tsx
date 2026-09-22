'use client';

/**
 * Draft PDPA (Thailand Personal Data Protection Act) notice copy.
 * This is placeholder text, not legal advice — have it reviewed by counsel
 * before relying on it in production.
 */
export const PDPA_CONSENT_VERSION = '2026-09-20';

import { dictionaries } from './i18n/dictionary';
import { useT } from './i18n/useT';
import { useLocale } from './i18n/LocaleContext';

export function PdpaNotice() {
  const t = useT();
  const { locale } = useLocale();
  const items = dictionaries[locale].pdpa.items;

  return (
    <div className="pdpa-notice">
      <h2>{t('pdpa.h2')}</h2>
      <p>{t('pdpa.intro')}</p>

      <h3>{t('pdpa.whatWeCollectTitle')}</h3>
      <ul>
        {items.map((item) => (
          <li key={item.term}><strong>{item.term}</strong> — {item.text}</li>
        ))}
      </ul>

      <h3>{t('pdpa.whyWeCollectTitle')}</h3>
      <p>{t('pdpa.whyWeCollectBody')}</p>

      <h3>{t('pdpa.whereStoredTitle')}</h3>
      <p>{t('pdpa.whereStoredBody')}</p>

      <h3>{t('pdpa.howLongTitle')}</h3>
      <p>{t('pdpa.howLongBody')}</p>

      <h3>{t('pdpa.yourRightsTitle')}</h3>
      <p>
        {t('pdpa.yourRightsBody')}{' '}
        <strong>privacy@jobfitcv.example</strong> {t('pdpa.yourRightsPlaceholderNote')}
      </p>
    </div>
  );
}
