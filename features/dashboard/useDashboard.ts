// Owner: Shared (led by Mahbub Hasnain) | dashboard (shared)
import { useMemo } from 'react';
import { useMeals } from '../../context/MealsContext';
import { useProfile } from '../../context/ProfileContext';
import { useTracking } from '../../context/TrackingContext';
import { useWorkout } from '../../context/WorkoutContext';
import { addDays, todayStr, weekStart } from '../../lib/dates';

const LOW_RATIO = 0.5; // "very low intake": under half the target on each of the last 3 logged days (SR-4)

export function useDashboard() {
  const { targets } = useProfile();
  const meals = useMeals();
  const { weights } = useTracking();
  const { history } = useWorkout();
  const today = todayStr();
  return useMemo(() => {
    const totals = meals.totalsFor(today);
    const todayMeals = meals.mealsFor(today);
    const ws = weekStart(today);
    const sessionsThisWeek = history.filter((s) => s.status !== 'in_progress' && s.startedAt.slice(0, 10) >= ws).length;
    const prev3 = [1, 2, 3].map((n) => meals.totalsFor(addDays(today, -n)).kcal);
    const lowIntake = !!targets && prev3.every((k) => k > 0 && k < targets.kcal * LOW_RATIO);
    return {
      today, totals, todayMeals, sessionsThisWeek, lowIntake,
      latestWeight: weights.length ? weights[weights.length - 1] : null,
    };
  }, [meals, weights, history, targets, today]);
}
