import { dictionaries } from './dictionary';
import { useLocale } from './LocaleContext';

function getPath(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((node, key) => {
    if (node && typeof node === 'object' && key in node) return (node as Record<string, unknown>)[key];
    return undefined;
  }, obj);
}

export function useT() {
  const { locale } = useLocale();

  function t(key: string): string {
    const value = getPath(dictionaries[locale], key);
    if (typeof value === 'string') return value;

    const fallback = getPath(dictionaries.en, key);
    if (typeof fallback === 'string') {
      console.warn(`Missing translation for "${key}" in locale "${locale}"`);
      return fallback;
    }

    console.warn(`Unknown translation key "${key}"`);
    return key;
  }

  return t;
}
