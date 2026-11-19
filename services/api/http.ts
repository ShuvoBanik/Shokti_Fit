// Owner: Shared (led by Mahbub Hasnain) | shell
/**
 * Real API client for the final phase (TRD section 6). NOT exercised in the midterm: no server exists yet,
 * and none of this has been run against one. Field names follow the schema (snake_case on the wire).
 */
import axios, { AxiosError } from 'axios';
import type { Api } from './types';
import { ApiError, networkError } from './errors';
import { secureToken } from '../../storage/secureToken';
import type { Food, Meal, Profile, Session, Targets } from '../../lib/types';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api';
const http = axios.create({ baseURL: BASE_URL, timeout: 10000 });

http.interceptors.request.use(async (cfg) => {
  const token = await secureToken.get();
  if (token) cfg.headers.set('Authorization', `Bearer ${token}`);
  return cfg;
});

const wrap = async <T>(p: Promise<{ data: T }>): Promise<T> => {
  try {
    return (await p).data;
  } catch (e) {
    const err = e as AxiosError<{ error?: { code: string; message: string; details?: { field: string }[] } }>;
    if (!err.response) throw networkError();
    const b = err.response.data?.error;
    throw new ApiError(err.response.status, b?.code ?? 'ERROR', b?.message ?? 'Request failed', b?.details);
  }
};

const camel = (s: string) => s.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toCamel = (o: any): any =>
  Array.isArray(o) ? o.map(toCamel) : o && typeof o === 'object' ? Object.fromEntries(Object.entries(o).map(([k, v]) => [camel(k), toCamel(v)])) : o;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapProfile = (r: any): { profile: Profile; targets: Targets; token?: string } => ({
  profile: {
    displayName: r.display_name, gender: r.gender, sexForCalc: r.gender === 'male' ? 'male' : 'female', age: r.age,
    heightCm: Number(r.height_cm), weightKg: Number(r.weight_kg), goal: r.goal, activity: r.activity_level, proteinPerKg: Number(r.protein_per_kg),
  },
  targets: {
    kcal: r.daily_kcal_target, proteinG: r.protein_target_g, carbG: r.carb_target_g, fatG: r.fat_target_g,
    floorApplied: !!r.warnings?.floor_applied, aggressiveGoal: !!r.warnings?.aggressive_goal,
  },
  token: r.token,
});
const profileBody = (p: Partial<Profile>) => ({
  display_name: p.displayName, gender: p.sexForCalc ?? p.gender, age: p.age, height_cm: p.heightCm, weight_kg: p.weightKg,
  goal: p.goal, activity_level: p.activity, protein_per_kg: p.proteinPerKg,
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapFood = (r: any): Food => ({
  id: r.id, nameEn: r.name_en, nameBn: r.name_bn ?? '', aliases: [], category: r.category, servingLabel: r.serving_label,
  servingG: Number(r.serving_g), listBasisG: 100, kcal100: Number(r.kcal_per_100g), protein100: Number(r.protein_g_per_100g),
  carb100: Number(r.carb_g_per_100g), fat100: Number(r.fat_g_per_100g), source: r.source_citation,
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapMeal = (r: any): Meal => ({
  id: r.id, clientId: r.client_id, foodId: r.food_id, foodNameEn: r.food_name_en ?? '', foodNameBn: r.food_name_bn ?? '',
  mealType: r.meal_type, logDate: r.log_date, grams: Number(r.grams), kcal: Number(r.kcal), proteinG: Number(r.protein_g),
  carbG: Number(r.carb_g), fatG: Number(r.fat_g),
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapSession = (r: any): Session => toCamel({ ...r, workout_name: r.workout_name ?? '', exercises_count: r.exercises_count ?? 0, sets: r.sets ?? [] });

export const httpApi: Api = {
  profiles: {
    create: async (p) => {
      const r = mapProfile(await wrap(http.post('/profiles', profileBody(p))));
      return { profile: r.profile, targets: r.targets, token: r.token ?? '' };
    },
    get: async () => mapProfile(await wrap(http.get('/profiles'))),
    update: async (p) => mapProfile(await wrap(http.patch('/profiles', profileBody(p)))),
    remove: async () => void (await wrap(http.delete('/profiles'))),
  },
  workouts: {
    list: async (q) => toCamel((await wrap<{ data: unknown[] }>(http.get('/workouts', { params: { level: q.level, no_equipment: q.noEquipment, tag: q.tag } }))).data),
    get: async (id) => toCamel(await wrap(http.get(`/workouts/${id}`))),
  },
  sessions: {
    start: async (b) => mapSession(await wrap(http.post('/sessions', { client_id: b.clientId, workout_id: b.workoutId, started_at: b.startedAt }))),
    finish: async (id, b) =>
      mapSession(await wrap(http.patch(`/sessions/${id}`, { status: b.status, ended_at: b.endedAt, sets: b.sets.map((s) => ({ exercise_id: s.exerciseId, set_number: s.setNumber, reps_done: s.repsDone, weight_kg: s.weightKg, completed: s.completed })) }))),
    list: async () => (await wrap<{ data: unknown[] }>(http.get('/sessions'))).data.map(mapSession),
  },
  foods: {
    search: async (q, category) => (await wrap<{ data: unknown[] }>(http.get('/foods', { params: { q, category } }))).data.map(mapFood),
    get: async (id) => mapFood(await wrap(http.get(`/foods/${id}`))),
    createCustom: async () => {
      throw new ApiError(501, 'NOT_IMPLEMENTED', 'Custom foods need a schema change (owner column). Final phase.');
    },
  },
  meals: {
    create: async (m) =>
      mapMeal(await wrap(http.post('/meals', { client_id: m.clientId, food_id: m.foodId, meal_type: m.mealType, log_date: m.logDate, grams: m.grams }))),
    listByDate: async (date) => {
      const r = await wrap<{ data: { meals?: unknown[] } | unknown[] }>(http.get('/meals', { params: { date } }));
      const rows = Array.isArray(r.data) ? r.data : r.data.meals ?? [];
      return rows.map(mapMeal);
    },
    listRange: async (from, to) => (await wrap<{ data: unknown[] }>(http.get('/meals', { params: { from, to } }))).data.map(mapMeal),
    remove: async (id) => void (await wrap(http.delete(`/meals/${id}`))),
  },
  weights: {
    list: async (from, to) => toCamel((await wrap<{ data: unknown[] }>(http.get('/weights', { params: { from, to } }))).data),
    upsert: async (entryDate, weightKg) => toCamel(await wrap(http.post('/weights', { entry_date: entryDate, weight_kg: weightKg }))),
  },
  water: {
    get: async (date) => toCamel(await wrap(http.get(`/water/${date}`))),
    put: async (date, amountMl, clientUpdatedAt) =>
      toCamel(await wrap(http.put(`/water/${date}`, { amount_ml: amountMl, client_updated_at: clientUpdatedAt }))),
  },
};
