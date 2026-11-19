// Owner: Rafsan Zaman Abir | F7, F8
import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import type { WeightEntry } from '../lib/types';
import { todayStr, uuid } from '../lib/dates';
import { api } from '../services/api';
import { ApiError } from '../services/api/errors';
import { outbox } from '../services/outbox';
import { KEYS, readJson, writeJson } from '../storage/cache';
import { useProfile } from './ProfileContext';
import { useSettings } from './SettingsContext';
import { useSnackbar } from './SnackbarContext';

export interface WaterEntry { id: string; ml: number; at: string }
interface State {
  weights: WeightEntry[];
  weightStatus: 'idle' | 'loading' | 'error';
  water: { date: string; amountMl: number; entries: WaterEntry[]; loaded: boolean };
}
type Action =
  | { type: 'W_STATUS'; status: State['weightStatus'] }
  | { type: 'W_SET'; weights: WeightEntry[] }
  | { type: 'W_UPSERT'; entry: WeightEntry }
  | { type: 'W_REMOVE_DATE'; date: string }
  | { type: 'WATER_SET'; date: string; amountMl: number; entries: WaterEntry[] };

const sortW = (w: WeightEntry[]) => [...w].sort((a, b) => a.entryDate.localeCompare(b.entryDate));
const reducer = (s: State, a: Action): State => {
  switch (a.type) {
    case 'W_STATUS': return { ...s, weightStatus: a.status };
    case 'W_SET': {
      const pending = s.weights.filter((w) => w.pending && !a.weights.some((x) => x.entryDate === w.entryDate && !w.pending));
      const merged = [...a.weights.filter((w) => !pending.some((p) => p.entryDate === w.entryDate)), ...pending];
      return { ...s, weights: sortW(merged), weightStatus: 'idle' };
    }
    case 'W_UPSERT': return { ...s, weights: sortW([...s.weights.filter((w) => w.entryDate !== a.entry.entryDate), a.entry]) };
    case 'W_REMOVE_DATE': return { ...s, weights: s.weights.filter((w) => w.entryDate !== a.date) };
    case 'WATER_SET': return { ...s, water: { date: a.date, amountMl: a.amountMl, entries: a.entries, loaded: true } };
  }
};

interface Ctx {
  weights: WeightEntry[];
  weightStatus: State['weightStatus'];
  loadWeights: () => Promise<void>;
  saveWeight: (date: string, kg: number) => Promise<void>;
  water: State['water'];
  waterPending: boolean;
  loadWater: () => Promise<void>;
  addWater: (ml: number) => void;
  undoWater: () => void;
  resetWater: () => void;
}
const TrackingContext = createContext<Ctx | null>(null);
const MAX_ML = 6000;

export function TrackingProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    weights: [], weightStatus: 'idle', water: { date: todayStr(), amountMl: 0, entries: [], loaded: false },
  });
  const { onboarded } = useProfile();
  const { t } = useSettings();
  const snack = useSnackbar();
  const [queuedDates, setQueuedDates] = useState<string[]>([]);

  const loadWeights = useCallback(async () => {
    dispatch({ type: 'W_STATUS', status: 'loading' });
    try {
      dispatch({ type: 'W_SET', weights: await api.weights.list() });
    } catch {
      dispatch({ type: 'W_STATUS', status: 'error' });
    }
  }, []);

  const loadWater = useCallback(async () => {
    const date = todayStr();
    const entries = await readJson<WaterEntry[]>(KEYS.waterEntries(date), []);
    const localSum = entries.reduce((s, e) => s + e.ml, 0);
    // Show the cached value immediately, then reconcile with the server.
    dispatch({ type: 'WATER_SET', date, amountMl: localSum, entries });
    try {
      const server = await api.water.get(date);
      const queued = outbox.snapshot().some((i) => i.type === 'water.put' && i.key === `water:${date}`);
      if (!queued) dispatch({ type: 'WATER_SET', date, amountMl: server.amountMl, entries });
    } catch {
      /* offline: keep cached value */
    }
  }, []);

  useEffect(() => {
    if (!onboarded) return;
    void loadWeights();
    void loadWater();
  }, [onboarded, loadWeights, loadWater]);

  useEffect(() => {
    const check = () => {
      const dates = outbox.snapshot().filter((i) => i.type === 'water.put').map((i) => i.payload.date as string);
      setQueuedDates(dates);
    };
    check();
    return outbox.subscribe(check);
  }, []);

  const saveWeight = useCallback(
    async (date: string, kg: number) => {
      const entry: WeightEntry = { id: `local-${date}`, entryDate: date, weightKg: kg, pending: true };
      const previous = state.weights.find((w) => w.entryDate === date);
      dispatch({ type: 'W_UPSERT', entry });
      try {
        const saved = await api.weights.upsert(date, kg);
        dispatch({ type: 'W_UPSERT', entry: saved });
      } catch (e) {
        if (e instanceof ApiError && !e.isNetwork) {
          if (previous) dispatch({ type: 'W_UPSERT', entry: previous });
          else dispatch({ type: 'W_REMOVE_DATE', date });
          throw e;
        }
        await outbox.enqueue('weight.post', { entryDate: date, weightKg: kg }, `weight:${date}`);
        snack.show({ kind: 'info', text: t('snack.weightQueued') });
      }
    },
    [state.weights, snack, t],
  );

  const commitWater = useCallback((amountMl: number, entries: WaterEntry[]) => {
    const date = todayStr();
    dispatch({ type: 'WATER_SET', date, amountMl, entries });
    void writeJson(KEYS.waterEntries(date), entries);
    void outbox
      .enqueue('water.put', { date, amountMl, clientUpdatedAt: new Date().toISOString() }, `water:${date}`)
      .then(() => outbox.flush(true));
  }, []);

  const addWater = useCallback(
    (ml: number) => {
      const cur = state.water.date === todayStr() ? state.water : { ...state.water, date: todayStr(), amountMl: 0, entries: [] };
      const amount = Math.min(MAX_ML, cur.amountMl + ml);
      if (amount === cur.amountMl) return;
      commitWater(amount, [...cur.entries, { id: uuid(), ml: amount - cur.amountMl, at: new Date().toISOString() }]);
    },
    [state.water, commitWater],
  );
  const undoWater = useCallback(() => {
    const last = state.water.entries[state.water.entries.length - 1];
    if (!last) return;
    commitWater(Math.max(0, state.water.amountMl - last.ml), state.water.entries.slice(0, -1));
  }, [state.water, commitWater]);
  const resetWater = useCallback(() => commitWater(0, []), [commitWater]);

  const value = useMemo<Ctx>(
    () => ({
      weights: state.weights, weightStatus: state.weightStatus, loadWeights, saveWeight,
      water: state.water, waterPending: queuedDates.includes(state.water.date), loadWater, addWater, undoWater, resetWater,
    }),
    [state, queuedDates, loadWeights, saveWeight, loadWater, addWater, undoWater, resetWater],
  );
  return <TrackingContext.Provider value={value}>{children}</TrackingContext.Provider>;
}

export function useTracking() {
  const c = useContext(TrackingContext);
  if (!c) throw new Error('TrackingProvider missing');
  return c;
}
