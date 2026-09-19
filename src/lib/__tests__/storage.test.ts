import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createStore, isRecord } from '../storage';

interface Thing { name: string }
const isThing = (v: unknown): v is Thing => isRecord(v) && typeof v['name'] === 'string';

function fakeStorage(overrides: Partial<Storage> = {}): Storage {
  const map = new Map<string, string>();
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => { map.set(k, String(v)); },
    removeItem: (k) => { map.delete(k); },
    clear: () => map.clear(),
    key: () => null,
    get length() { return map.size; },
    ...overrides,
  };
}

describe('createStore', () => {
  const original = globalThis.localStorage;
  beforeEach(() => { Object.defineProperty(globalThis, 'localStorage', { value: fakeStorage(), configurable: true }); });
  afterEach(() => { Object.defineProperty(globalThis, 'localStorage', { value: original, configurable: true }); });

  it('round-trips a value', () => {
    const store = createStore<Thing>('t', isThing);
    store.save({ name: 'a' });
    expect(store.load()).toEqual({ name: 'a' });
    store.clear();
    expect(store.load()).toBeNull();
  });

  it('returns null for corrupt or wrong-shaped values', () => {
    localStorage.setItem('t', '{not json');
    expect(createStore<Thing>('t', isThing).load()).toBeNull();
    localStorage.setItem('t', JSON.stringify({ nope: 1 }));
    expect(createStore<Thing>('t', isThing).load()).toBeNull();
  });

  it('survives a throwing localStorage', () => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: fakeStorage({
        getItem: () => { throw new Error('blocked'); },
        setItem: () => { throw new Error('blocked'); },
      }),
      configurable: true,
    });
    const store = createStore<Thing>('t', isThing);
    expect(() => store.save({ name: 'a' })).not.toThrow();
    expect(store.load()).toBeNull();
  });
});
