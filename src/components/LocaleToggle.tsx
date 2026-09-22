'use client';

import { useLocale } from '../lib/i18n/LocaleContext';

export function LocaleToggle() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="locale-toggle" role="group" aria-label="Language">
      <button
        type="button"
        className={locale === 'en' ? 'active' : ''}
        aria-pressed={locale === 'en'}
        onClick={() => setLocale('en')}
      >
        EN
      </button>
      <button
        type="button"
        className={locale === 'th' ? 'active' : ''}
        aria-pressed={locale === 'th'}
        onClick={() => setLocale('th')}
      >
        TH
      </button>
    </div>
  );
}
