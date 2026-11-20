// Owner: Swarna Sikder | F5, F6
import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import type { Food, Meal, MealType } from '../lib/types';
import { addDays, todayStr, uuid } from '../lib/dates';
import { nutritionFor } from '../lib/nutrition';
import { api } from '../services/api';
import { ApiError } from '../services/api/errors';
import { outbox } from '../services/outbox';
import { useSettings } from './SettingsContext';
import { useSnackbar } from './SnackbarContext';
import { useProfile } from './ProfileContext';

type Status = 'idle' | 'loading' | 'error';
interface State {
  meals: Meal[];
  hidden: string[]; // removed locally, waiting for the undo window to close
  status: Status;
}
type Action =
  | { type: 'STATUS'; status: Status }
  | { type: 'SET'; meals: Meal[] }
  | { type: 'ADD'; meal: Meal }
  | { type: 'REPLACE'; clientId: string; meal: Meal }
  | { type: 'ROLLBACK'; clientId: string }
  | { type: 'HIDE'; id: string }
  | { type: 'UNHIDE'; id: string }
  | { type: 'DROP'; id: string };

const reducer = (s: State, a: Action): State => {
  switch (a.type) {
    case 'STATUS': return { ...s, status: a.status };
    case 'SET': {
      // keep optimistic pending meals that the server list does not know yet
      const known = new Set(a.meals.map((m) => m.clientId));
      const pending = s.meals.filter((m) => m.pending && !known.has(m.clientId));
      return { ...s, meals: [...a.meals, ...pending], status: 'idle' };
    }
    case 'ADD': return { ...s, meals: [...s.meals, a.meal] };
    case 'REPLACE': return { ...s, meals: s.meals.map((m) => (m.clientId === a.clientId ? a.meal : m)) };
    case 'ROLLBACK': return { ...s, meals: s.meals.filter((m) => m.clientId !== a.clientId) };
    case 'HIDE': return { ...s, hidden: [...s.hidden, a.id] };
    case 'UNHIDE': return { ...s, hidden: s.hidden.filter((x) => x !== a.id) };
    case 'DROP': return { ...s, hidden: s.hidden.filter((x) => x !== a.id), meals: s.meals.filter((m) => m.id !== a.id) };
  }
};

export interface Totals { kcal: number; proteinG: number; carbG: number; fatG: number }
const sum = (ms: Meal[]): Totals =>
  ms.reduce((t, m) => ({ kcal: t.kcal + m.kcal, proteinG: t.proteinG + m.proteinG, carbG: t.carbG + m.carbG, fatG: t.fatG + m.fatG }), { kcal: 0, proteinG: 0, carbG: 0, fatG: 0 });

interface Ctx {
  status: Status;
  hasPending: boolean;
  load: () => Promise<void>;
  mealsFor: (date: string) => Meal[];
  totalsFor: (date: string) => Totals;
  addMeal: (food: Food, grams: number, mealType: MealType, date?: string) => Promise<void>;
  removeMeal: (meal: Meal) => void;
  replaceMeal: (meal: Meal, food: Food, grams: number) => Promise<void>;
}
const MealsContext = createContext<Ctx | null>(null);
const RANGE_DAYS = 90;

export function MealsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { meals: [], hidden: [], status: 'idle' });
  const { t } = useSettings();
  const snack = useSnackbar();
  const { onboarded } = useProfile();
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const inflight = useRef(new Set<string>());
  const [prevQueued, setPrevQueued] = useState<string[]>([]);

  const load = useCallback(async () => {
    dispatch({ type: 'STATUS', status: 'loading' });
    try {
      const today = todayStr();
      const meals = await api.meals.listRange(addDays(today, -RANGE_DAYS), today);
      dispatch({ type: 'SET', meals });
    } catch {
      dispatch({ type: 'STATUS', status: 'error' });
    }
  }, []);

  useEffect(() => {
    if (onboarded) void load();
  }, [onboarded, load]);

  // When queued meals finish syncing, reload so local ids are replaced by server ids.
  useEffect(() => {
    const check = () => {
      const queued = outbox.snapshot().filter((i) => i.type === 'meal.create').map((i) => i.payload.clientId as string);
      setPrevQueued((prev) => {
        if (prev.some((id) => !queued.includes(id))) void load();
        return queued;
      });
    };
    check();
    return outbox.subscribe(check);
  }, [load]);

  const visible = useMemo(() => state.meals.filter((m) => !state.hidden.includes(m.id)), [state.meals, state.hidden]);
  const mealsFor = useCallback((date: string) => visible.filter((m) => m.logDate === date), [visible]);
  const totalsFor = useCallback((date: string) => sum(visible.filter((m) => m.logDate === date)), [visible]);

  const addMeal = useCallback(
    async (food: Food, grams: number, mealType: MealType, date = todayStr()) => {
      const clientId = uuid();
      const base = {
        clientId, foodId: food.id, foodNameEn: food.nameEn, foodNameBn: food.nameBn, mealType, logDate: date, grams,
        ...nutritionFor(food, grams),
      };
      dispatch({ type: 'ADD', meal: { ...base, id: `local-${clientId}`, pending: true } });
      inflight.current.add(clientId);
      try {
        const saved = await api.meals.create(base);
        dispatch({ type: 'REPLACE', clientId, meal: saved });
      } catch (e) {
        if (e instanceof ApiError && !e.isNetwork) {
          dispatch({ type: 'ROLLBACK', clientId });
          snack.show({ kind: 'error', text: e.message || t('err.generic') });
          return;
        }
        await outbox.enqueue('meal.create', base, undefined, clientId);
        snack.show({ kind: 'info', text: t('snack.mealQueued') });
      } finally {
        inflight.current.delete(clientId);
      }
    },
    [snack, t],
  );

  const finalizeRemove = useCallback(
    async (meal: Meal) => {
      timers.current.delete(meal.id);
      try {
        if (meal.pending) {
          await outbox.discard(meal.clientId);
          dispatch({ type: 'DROP', id: meal.id });
          return;
        }
        await api.meals.remove(meal.id);
        dispatch({ type: 'DROP', id: meal.id });
      } catch {
        dispatch({ type: 'UNHIDE', id: meal.id });
        snack.show({ kind: 'error', text: t('snack.deleteFailed') });
      }
    },
    [snack, t],
  );

  const removeMeal = useCallback(
    (meal: Meal) => {
      dispatch({ type: 'HIDE', id: meal.id });
      const timer = setTimeout(() => void finalizeRemove(meal), 5000);
      timers.current.set(meal.id, timer);
      snack.show({
        text: t('snack.mealDeleted'),
        actionLabel: t('common.undo'),
        durationMs: 5000,
        onAction: () => {
          const tm = timers.current.get(meal.id);
          if (tm) clearTimeout(tm);
          timers.current.delete(meal.id);
          dispatch({ type: 'UNHIDE', id: meal.id }); // restored locally; no server call
        },
      });
    },
    [finalizeRemove, snack, t],
  );

  const replaceMeal = useCallback(
    async (meal: Meal, food: Food, grams: number) => {
      // Meals are append-only on the server, so editing a portion = remove + add.
      if (!meal.pending) await api.meals.remove(meal.id);
      else await outbox.discard(meal.clientId);
      dispatch({ type: 'DROP', id: meal.id });
      await addMeal(food, grams, meal.mealType, meal.logDate);
    },
    [addMeal],
  );

  useEffect(() => {
    const tm = timers.current;
    return () => tm.forEach((x) => clearTimeout(x));
  }, []);

  const value = useMemo<Ctx>(
    () => ({ status: state.status, hasPending: visible.some((m) => m.pending), load, mealsFor, totalsFor, addMeal, removeMeal, replaceMeal }),
    [state.status, visible, load, mealsFor, totalsFor, addMeal, removeMeal, replaceMeal],
  );
  void prevQueued;
  return <MealsContext.Provider value={value}>{children}</MealsContext.Provider>;
}

export function useMeals() {
  const c = useContext(MealsContext);
  if (!c) throw new Error('MealsProvider missing');
  return c;
}
