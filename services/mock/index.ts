// Owner: Shared (led by Mahbub Hasnain) | shell
import type { Api } from '../api/types';
import { ApiError, networkError } from '../api/errors';
import { calculateTargets } from './calorie';
import { allFoods, getDb, resetDb, saveDb, seedDemoHistory } from './db';
import { WORKOUTS } from './seed';
import { mockControl } from './control';
import { LIMITS, isValidWeightKg } from '../../lib/validation';
import { uuid } from '../../lib/dates';
import { nutritionFor } from '../../lib/nutrition';
import type { Food, Meal } from '../../lib/types';

const LATENCY = 150;
const guard = async () => {
  await new Promise((r) => setTimeout(r, LATENCY));
  if (mockControl.isOffline()) throw networkError();
  return getDb();
};
const notFound = () => new ApiError(404, 'NOT_FOUND', 'Not found');

export const mockApi: Api = {
  profiles: {
    async create(p) {
      const d = await guard();
      const details: { field: string; rule: string }[] = [];
      if (!p.displayName.trim()) details.push({ field: 'name', rule: 'required' });
      if (p.age < LIMITS.age.min || p.age > LIMITS.age.max) details.push({ field: 'age', rule: 'range' });
      if (p.heightCm < LIMITS.heightCm.min || p.heightCm > LIMITS.heightCm.max) details.push({ field: 'height', rule: 'range' });
      if (!isValidWeightKg(p.weightKg)) details.push({ field: 'weight', rule: 'range' });
      if (details.length) throw new ApiError(400, 'VALIDATION_FAILED', 'Check the highlighted fields.', details);
      await resetDb();
      const fresh = await getDb();
      fresh.profile = p;
      fresh.targets = calculateTargets(p);
      fresh.token = uuid() + uuid();
      seedDemoHistory(fresh);
      await saveDb();
      void d;
      return { profile: fresh.profile, targets: fresh.targets, token: fresh.token };
    },
    async get() {
      const d = await guard();
      if (!d.profile || !d.targets) throw new ApiError(401, 'UNAUTHORIZED', 'No profile');
      return { profile: d.profile, targets: d.targets };
    },
    async update(patch) {
      const d = await guard();
      if (!d.profile) throw new ApiError(401, 'UNAUTHORIZED', 'No profile');
      const next = { ...d.profile, ...patch };
      d.profile = next;
      d.targets = calculateTargets(next);
      await saveDb();
      return { profile: d.profile, targets: d.targets };
    },
    async remove() {
      await guard();
      await resetDb();
    },
  },
  workouts: {
    async list({ level, noEquipment, tag }) {
      await guard();
      return WORKOUTS.filter(
        (w) => (!level || w.level === level) && (!noEquipment || !w.equipmentRequired) && (!tag || w.tags.includes(tag)),
      );
    },
    async get(id) {
      await guard();
      const w = WORKOUTS.find((x) => x.id === id);
      if (!w) throw notFound();
      return w;
    },
  },
  sessions: {
    async start({ clientId, workoutId, startedAt }) {
      const d = await guard();
      const existing = d.sessions.find((s) => s.clientId === clientId);
      if (existing) return existing;
      const w = WORKOUTS.find((x) => x.id === workoutId);
      if (!w) throw notFound();
      const s = { id: uuid(), clientId, workoutId, workoutName: w.nameEn, status: 'in_progress' as const, startedAt, sets: [], exercisesCount: w.exercises.length };
      d.sessions.push(s);
      await saveDb();
      return s;
    },
    async finish(id, b) {
      const d = await guard();
      const s = d.sessions.find((x) => x.id === id);
      if (!s) throw notFound();
      if (s.status !== 'in_progress') return s; // idempotent; a finished session never reopens
      Object.assign(s, { status: b.status, endedAt: b.endedAt, durationSeconds: b.durationSeconds, sets: b.sets });
      await saveDb();
      return s;
    },
    async list() {
      const d = await guard();
      return [...d.sessions].filter((s) => s.status !== 'in_progress').sort((a, b) => b.startedAt.localeCompare(a.startedAt));
    },
  },
  foods: {
    async search(q, category) {
      const d = await guard();
      const term = q.trim().toLowerCase();
      return allFoods(d).filter((f) => {
        if (category && category !== 'All' && f.category !== category) return false;
        if (term.length < 2) return true;
        return [f.nameEn, f.nameBn, ...f.aliases].some((n) => n.toLowerCase().includes(term));
      });
    },
    async get(id) {
      const d = await guard();
      const f = allFoods(d).find((x) => x.id === id);
      if (!f) throw notFound();
      return f;
    },
    async createCustom(f) {
      const d = await guard();
      const food: Food = { ...f, id: `custom-${uuid()}`, nameBn: '', aliases: [], category: 'Custom', listBasisG: 100, custom: true };
      d.customFoods.push(food);
      await saveDb();
      return food;
    },
  },
  meals: {
    async create(m) {
      const d = await guard();
      const existing = d.meals.find((x) => x.clientId === m.clientId);
      if (existing) return existing;
      if (m.grams <= 0 || m.grams > 3000) throw new ApiError(422, 'RULE_VIOLATION', 'Portion must be between 1 and 3000 g.');
      const meal: Meal = { ...m, id: uuid() };
      d.meals.push(meal);
      await saveDb();
      return meal;
    },
    async listByDate(date) {
      const d = await guard();
      return d.meals.filter((m) => m.logDate === date);
    },
    async listRange(from, to) {
      const d = await guard();
      return d.meals.filter((m) => m.logDate >= from && m.logDate <= to);
    },
    async remove(id) {
      const d = await guard();
      d.meals = d.meals.filter((m) => m.id !== id);
      await saveDb();
    },
  },
  weights: {
    async list(from, to) {
      const d = await guard();
      return d.weights
        .filter((w) => (!from || w.entryDate >= from) && (!to || w.entryDate <= to))
        .sort((a, b) => a.entryDate.localeCompare(b.entryDate));
    },
    async upsert(entryDate, weightKg) {
      const d = await guard();
      if (!isValidWeightKg(weightKg)) throw new ApiError(400, 'VALIDATION_FAILED', 'Enter a weight between 30 and 200 kg.', [{ field: 'weight_kg', rule: 'range' }]);
      const existing = d.weights.find((w) => w.entryDate === entryDate);
      if (existing) {
        existing.weightKg = weightKg;
        await saveDb();
        return existing;
      }
      const entry = { id: uuid(), entryDate, weightKg };
      d.weights.push(entry);
      await saveDb();
      return entry;
    },
  },
  water: {
    async get(date) {
      const d = await guard();
      return d.water[date] ?? { logDate: date, amountMl: 0, clientUpdatedAt: new Date(0).toISOString() };
    },
    async put(date, amountMl, clientUpdatedAt) {
      const d = await guard();
      if (amountMl < 0 || amountMl > 6000) throw new ApiError(400, 'VALIDATION_FAILED', 'Water must be between 0 and 6000 ml.');
      const cur = d.water[date];
      if (cur && cur.clientUpdatedAt > clientUpdatedAt) return cur; // older write ignored
      d.water[date] = { logDate: date, amountMl, clientUpdatedAt };
      await saveDb();
      return d.water[date];
    },
  },
};

export { nutritionFor };
