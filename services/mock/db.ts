// Owner: Shared (led by Mahbub Hasnain) | shell
import type { Food, Meal, Profile, Session, Targets, WaterDay, WeightEntry } from '../../lib/types';
import { addDays, todayStr, uuid } from '../../lib/dates';
import { nutritionFor } from '../../lib/nutrition';
import { KEYS, readJson, writeJson } from '../../storage/cache';
import { FOODS, WORKOUTS } from './seed';

/** Demo history makes charts and history screens meaningful for the midterm demo. Set false for a clean start. */
export const SEED_DEMO_HISTORY = true;

export interface MockDb {
  profile: Profile | null;
  targets: Targets | null;
  token: string | null;
  customFoods: Food[];
  meals: Meal[];
  weights: WeightEntry[];
  water: Record<string, WaterDay>;
  sessions: Session[];
}

const empty = (): MockDb => ({ profile: null, targets: null, token: null, customFoods: [], meals: [], weights: [], water: {}, sessions: [] });

let db: MockDb = empty();
let loaded = false;

export async function getDb() {
  if (!loaded) {
    db = await readJson<MockDb>(KEYS.mockDb, empty());
    loaded = true;
  }
  return db;
}
export async function saveDb() {
  await writeJson(KEYS.mockDb, db);
}
export async function resetDb() {
  db = empty();
  loaded = true;
  await saveDb();
}
export const allFoods = (d: MockDb) => [...FOODS, ...d.customFoods];

export function seedDemoHistory(d: MockDb) {
  if (!SEED_DEMO_HISTORY || !d.profile) return;
  const today = todayStr();
  const w = d.profile.weightKg;
  // Weights anchored to the weight the user entered, drifting down slightly towards it.
  const deltas: [number, number][] = [[-28, 2.2], [-24, 1.4], [-18, 0.6], [-12, 0.2], [-8, 0.3], [-4, 0.2]];
  deltas.forEach(([off, dl]) =>
    d.weights.push({ id: uuid(), entryDate: addDays(today, off), weightKg: Math.round((w + dl) * 10) / 10 }),
  );
  d.weights.push({ id: uuid(), entryDate: today, weightKg: w });

  const foods = Object.fromEntries(FOODS.map((f) => [f.id, f]));
  const mk = (date: string, foodId: string, type: Meal['mealType'], grams: number): Meal => {
    const f = foods[foodId];
    return { id: uuid(), clientId: uuid(), foodId, foodNameEn: f.nameEn, foodNameBn: f.nameBn, mealType: type, logDate: date, grams, ...nutritionFor(f, grams) };
  };
  const scale = [1.15, 1.0, 1.25, 1.1, 0.95, 1.2];
  scale.forEach((s, i) => {
    const date = addDays(today, -(i + 1));
    d.meals.push(
      mk(date, 'food-egg', 'breakfast', Math.round(100 * s)),
      mk(date, 'food-banana', 'breakfast', 118),
      mk(date, 'food-rice', 'lunch', Math.round(300 * s)),
      mk(date, 'food-lentils', 'lunch', Math.round(150 * s)),
      mk(date, 'food-rice', 'dinner', Math.round(250 * s)),
      mk(date, 'food-lentils', 'dinner', Math.round(200 * s)),
      mk(date, 'food-banana', 'snack', 236),
    );
  });

  const wk = WORKOUTS[0];
  const sets = wk.exercises.flatMap((e) =>
    Array.from({ length: e.sets }, (_, i) => ({ exerciseId: e.id, setNumber: i + 1, repsDone: parseInt(e.reps, 10) || 0, completed: true })),
  );
  const mkSession = (off: number, workoutIdx: number, status: 'completed' | 'partial', secs: number, nSets?: number): Session => {
    const wo = WORKOUTS[workoutIdx];
    const start = new Date();
    start.setDate(start.getDate() + off);
    start.setHours(18, 0, 0, 0);
    const wsets = wo.exercises.flatMap((e) =>
      Array.from({ length: e.sets }, (_, i) => ({ exerciseId: e.id, setNumber: i + 1, repsDone: parseInt(e.reps, 10) || 0, completed: true })),
    );
    return {
      id: uuid(), clientId: uuid(), workoutId: wo.id, workoutName: wo.nameEn, status, startedAt: start.toISOString(),
      endedAt: new Date(start.getTime() + secs * 1000).toISOString(), durationSeconds: secs,
      sets: nSets ? wsets.slice(0, nSets) : wsets, exercisesCount: wo.exercises.length,
    };
  };
  void sets;
  d.sessions.push(
    mkSession(-1, 0, 'completed', 1800),
    mkSession(-2, 0, 'partial', 754, 4),
    mkSession(-3, 2, 'completed', 1200),
    mkSession(-4, 1, 'completed', 1500),
    mkSession(-8, 0, 'completed', 1800),
  );
}
