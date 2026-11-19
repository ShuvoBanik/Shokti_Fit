// Owner: Rafsan Zaman Abir + Swarna Sikder | F8, F6 (task O1)
import { api } from './api';
import { outbox } from './outbox';
import type { NewMeal, SessionSet } from '../lib/types';

let registered = false;
export function registerSyncHandlers() {
  if (registered) return;
  registered = true;
  outbox.registerHandler('meal.create', async (p) => {
    await api.meals.create(p as unknown as NewMeal);
  });
  outbox.registerHandler('water.put', async (p) => {
    await api.water.put(p.date as string, p.amountMl as number, p.clientUpdatedAt as string);
  });
  outbox.registerHandler('weight.post', async (p) => {
    await api.weights.upsert(p.entryDate as string, p.weightKg as number);
  });
  outbox.registerHandler('session.save', async (p) => {
    const s = await api.sessions.start({ clientId: p.clientId as string, workoutId: p.workoutId as string, startedAt: p.startedAt as string });
    await api.sessions.finish(s.id, {
      status: p.status as 'completed' | 'partial',
      endedAt: p.endedAt as string,
      durationSeconds: p.durationSeconds as number,
      sets: p.sets as SessionSet[],
    });
  });
}
