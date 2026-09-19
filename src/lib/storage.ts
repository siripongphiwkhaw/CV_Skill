/**
 * Guarded localStorage stores. Every read and write is wrapped, because
 * localStorage can throw (private windows, blocked storage, quota) and a
 * corrupt value must never take the app down — it just reads as "nothing saved".
 */

export interface Store<T> {
  load(): T | null;
  save(value: T): void;
  clear(): void;
}

export function createStore<T>(key: string, isT: (value: unknown) => value is T): Store<T> {
  return {
    load() {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        const parsed: unknown = JSON.parse(raw);
        return isT(parsed) ? parsed : null;
      } catch {
        return null;
      }
    },
    save(value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        /* storage unavailable — the value stays in memory for this session */
      }
    },
    clear() {
      try {
        localStorage.removeItem(key);
      } catch {
        /* ignore */
      }
    },
  };
}

export const KEYS = {
  cv: 'cv-job-fit:cv:v1',
  profile: 'cv-job-fit:profile:v1',
  session: 'cv-job-fit:session:v1',
} as const;

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
