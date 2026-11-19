// Owner: Rafsan Zaman Abir + Swarna Sikder | F8, F6 (task O1)
/**
 * Offline outbox (TRD section 8). Items are sent in creation order; a failed item blocks later items of the
 * same type; exponential backoff 2,4,8,16,32,60 s with up to 20% jitter; 10 attempts then `failed`;
 * a 4xx other than 401/429 fails immediately; a 401 stops the flush.
 * Idempotency comes from client ids and the server's unique keys (mock mirrors this).
 */
import { KEYS, readJson, writeJson } from '../storage/cache';
import { ApiError } from './api/errors';
import { uuid } from '../lib/dates';

export type OutboxType = 'meal.create' | 'water.put' | 'session.save' | 'weight.post';
export type OutboxState = 'pending' | 'sending' | 'failed';
export interface OutboxItem {
  clientId: string;
  type: OutboxType;
  /** coalescing key: a newer item with the same key replaces a not-yet-sent one (PUT is idempotent) */
  key?: string;
  payload: Record<string, unknown>;
  attempts: number;
  nextAttemptAt: number;
  createdAt: number;
  state: OutboxState;
}
type Handler = (payload: Record<string, unknown>) => Promise<void>;
type Listener = () => void;

const BACKOFF = [2, 4, 8, 16, 32, 60];
const MAX_ATTEMPTS = 10;

let items: OutboxItem[] = [];
let loaded = false;
let flushing = false;
let authStopped = false;
const handlers = new Map<OutboxType, Handler>();
const listeners = new Set<Listener>();
const emit = () => listeners.forEach((l) => l());
const persist = () => writeJson(KEYS.outbox, items);

export const outbox = {
  registerHandler(type: OutboxType, h: Handler) {
    handlers.set(type, h);
  },
  subscribe(l: Listener) {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
  snapshot: () => items,
  async load() {
    if (loaded) return;
    items = (await readJson<OutboxItem[]>(KEYS.outbox, [])).map((i) => (i.state === 'sending' ? { ...i, state: 'pending' as const } : i));
    loaded = true;
    emit();
  },
  async enqueue(type: OutboxType, payload: Record<string, unknown>, key?: string, clientId?: string) {
    await outbox.load();
    if (key) items = items.filter((i) => !(i.type === type && i.key === key && i.state === 'pending'));
    items.push({ clientId: clientId ?? uuid(), type, key, payload, attempts: 0, nextAttemptAt: 0, createdAt: Date.now(), state: 'pending' });
    await persist();
    emit();
  },
  async flush(force = false) {
    await outbox.load();
    if (flushing) return;
    flushing = true;
    authStopped = false;
    try {
      const blocked = new Set<OutboxType>();
      for (const item of [...items].sort((a, b) => a.createdAt - b.createdAt)) {
        if (authStopped) break;
        if (item.state === 'failed') {
          blocked.add(item.type);
          continue;
        }
        if (blocked.has(item.type)) continue;
        if (!force && item.nextAttemptAt > Date.now()) {
          blocked.add(item.type);
          continue;
        }
        const h = handlers.get(item.type);
        if (!h) continue;
        item.state = 'sending';
        emit();
        try {
          await h(item.payload);
          items = items.filter((i) => i !== item);
        } catch (e) {
          const err = e instanceof ApiError ? e : new ApiError(0, 'NETWORK_ERROR', 'offline');
          item.attempts += 1;
          if (err.status === 401) {
            item.state = 'pending';
            authStopped = true;
          } else if (err.status >= 400 && err.status < 500 && err.status !== 429) {
            item.state = 'failed';
            blocked.add(item.type);
          } else {
            const base = BACKOFF[Math.min(item.attempts - 1, BACKOFF.length - 1)];
            item.nextAttemptAt = Date.now() + base * 1000 * (1 + Math.random() * 0.2);
            item.state = item.attempts >= MAX_ATTEMPTS ? 'failed' : 'pending';
            blocked.add(item.type);
          }
        }
        await persist();
        emit();
      }
    } finally {
      flushing = false;
      emit();
    }
  },
  async retry(clientId: string) {
    items = items.map((i) => (i.clientId === clientId ? { ...i, state: 'pending' as const, attempts: 0, nextAttemptAt: 0 } : i));
    await persist();
    emit();
    await outbox.flush(true);
  },
  async discard(clientId: string) {
    items = items.filter((i) => i.clientId !== clientId);
    await persist();
    emit();
  },
  async clear() {
    items = [];
    await persist();
    emit();
  },
  isAuthStopped: () => authStopped,
};
