# File ownership

Every `.ts`/`.tsx` file starts with an `// Owner:` line. Re-run `python3 scripts/mark-owners.py` after adding files (edit RULES inside it).

| File | Owner | Feature |
|---|---|---|
| `app/(onboarding)/_layout.tsx` | Mahbub Hasnain | F1 |
| `app/(onboarding)/disclaimer.tsx` | Mahbub Hasnain | F1 |
| `app/(onboarding)/intro.tsx` | Mahbub Hasnain | F1 |
| `app/(onboarding)/profile-setup.tsx` | Mahbub Hasnain | F1 |
| `app/(onboarding)/target-summary.tsx` | Mahbub Hasnain | F1 |
| `app/(onboarding)/welcome.tsx` | Mahbub Hasnain | F1 |
| `app/(tabs)/profile/_layout.tsx` | Mahbub Hasnain | F2 |
| `app/(tabs)/profile/edit.tsx` | Mahbub Hasnain | F2 |
| `app/(tabs)/profile/index.tsx` | Mahbub Hasnain | F2 |
| `app/(tabs)/profile/settings.tsx` | Mahbub Hasnain | F2 |
| `context/ProfileContext.tsx` | Mahbub Hasnain | F1, F2 |
| `features/f1-profile/ProfileForm.tsx` | Mahbub Hasnain | F1 |
| `features/f1-profile/TargetCard.tsx` | Mahbub Hasnain | F1 |
| `features/f2-profile/DeleteDataSheet.tsx` | Mahbub Hasnain | F2 |
| `services/mock/calorie.ts` | Mahbub Hasnain | F1 |
| `lib/validation.ts` | Mahbub Hasnain (profile rules), Swarna Sikder (custom food), Rafsan Zaman Abir (weight) | F1, F6, F7 |
| `app/(tabs)/home/progress.tsx` | Rafsan Zaman Abir | F7 |
| `app/(tabs)/home/water.tsx` | Rafsan Zaman Abir | F8 |
| `app/(tabs)/home/weight-entry.tsx` | Rafsan Zaman Abir | F7 |
| `app/(tabs)/home/weight-history.tsx` | Rafsan Zaman Abir | F7 |
| `context/TrackingContext.tsx` | Rafsan Zaman Abir | F7, F8 |
| `hooks/useNetworkStatus.ts` | Rafsan Zaman Abir | F8 |
| `hooks/useOutbox.ts` | Rafsan Zaman Abir | F8 |
| `services/outbox.ts` | Rafsan Zaman Abir + Swarna Sikder | F8, F6 (task O1) |
| `services/syncHandlers.ts` | Rafsan Zaman Abir + Swarna Sikder | F8, F6 (task O1) |
| `tests/logic.test.ts` | Shared (Mahbub Hasnain calorie/validation, others add theirs) | tests |
| `components/charts.tsx` | Shared (charts: Rafsan Zaman Abir, ring: Mahbub Hasnain) | F7, dashboard |
| `app/(tabs)/_layout.tsx` | Shared (led by Mahbub Hasnain) | shell |
| `app/(tabs)/home/_layout.tsx` | Shared (led by Mahbub Hasnain) | shell |
| `app/(tabs)/home/index.tsx` | Shared (led by Mahbub Hasnain) | dashboard (shared) |
| `app/_layout.tsx` | Shared (led by Mahbub Hasnain) | shell |
| `app/index.tsx` | Shared (led by Mahbub Hasnain) | shell |
| `components/AppText.tsx` | Shared (led by Mahbub Hasnain) | shell |
| `components/TabBar.tsx` | Shared (led by Mahbub Hasnain) | shell |
| `components/ui.tsx` | Shared (led by Mahbub Hasnain) | shell |
| `context/SettingsContext.tsx` | Shared (led by Mahbub Hasnain) | shell |
| `context/SnackbarContext.tsx` | Shared (led by Mahbub Hasnain) | shell |
| `features/dashboard/useDashboard.ts` | Shared (led by Mahbub Hasnain) | dashboard (shared) |
| `i18n/bn.ts` | Shared (led by Mahbub Hasnain) | shell |
| `i18n/en.ts` | Shared (led by Mahbub Hasnain) | shell |
| `i18n/index.ts` | Shared (led by Mahbub Hasnain) | shell |
| `lib/dates.ts` | Shared (led by Mahbub Hasnain) | shell |
| `lib/types.ts` | Shared (led by Mahbub Hasnain) | shell |
| `lib/units.ts` | Shared (led by Mahbub Hasnain) | shell |
| `services/api/errors.ts` | Shared (led by Mahbub Hasnain) | shell |
| `services/api/http.ts` | Shared (led by Mahbub Hasnain) | shell |
| `services/api/index.ts` | Shared (led by Mahbub Hasnain) | shell |
| `services/api/types.ts` | Shared (led by Mahbub Hasnain) | shell |
| `services/mock/control.ts` | Shared (led by Mahbub Hasnain) | shell |
| `services/mock/db.ts` | Shared (led by Mahbub Hasnain) | shell |
| `services/mock/index.ts` | Shared (led by Mahbub Hasnain) | shell |
| `services/mock/seed/index.ts` | Shared (led by Mahbub Hasnain) | shell |
| `storage/cache.ts` | Shared (led by Mahbub Hasnain) | shell |
| `storage/secureToken.ts` | Shared (led by Mahbub Hasnain) | shell |
| `theme/tokens.ts` | Shared (led by Mahbub Hasnain) | shell |
| `app/(tabs)/workouts/[id].tsx` | Shuvrata Banik Shuvo | F3, F4 |
| `app/(tabs)/workouts/_layout.tsx` | Shuvrata Banik Shuvo | F3, F4 |
| `app/(tabs)/workouts/history.tsx` | Shuvrata Banik Shuvo | F3, F4 |
| `app/(tabs)/workouts/index.tsx` | Shuvrata Banik Shuvo | F3, F4 |
| `app/(tabs)/workouts/session/[id].tsx` | Shuvrata Banik Shuvo | F3, F4 |
| `context/WorkoutContext.tsx` | Shuvrata Banik Shuvo | F3, F4 |
| `services/mock/seed/workouts.ts` | Shuvrata Banik Shuvo | F3, F4 |
| `app/(tabs)/food/[id].tsx` | Swarna Sikder | F5, F6 |
| `app/(tabs)/food/_layout.tsx` | Swarna Sikder | F5, F6 |
| `app/(tabs)/food/custom.tsx` | Swarna Sikder | F5, F6 |
| `app/(tabs)/food/index.tsx` | Swarna Sikder | F5, F6 |
| `app/(tabs)/food/meal-log.tsx` | Swarna Sikder | F5, F6 |
| `context/MealsContext.tsx` | Swarna Sikder | F5, F6 |
| `hooks/useDebounce.ts` | Swarna Sikder | F5 |
| `lib/nutrition.ts` | Swarna Sikder | F5, F6 |
| `services/mock/seed/foods.ts` | Swarna Sikder | F5, F6 |
