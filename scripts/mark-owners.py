#!/usr/bin/env python3
"""Adds an '// Owner: ...' first line to every .ts/.tsx file and writes OWNERS.md. Safe to re-run."""
import os, re, fnmatch

M, S, W, R = "Mahbub Hasnain", "Shuvrata Banik Shuvo", "Swarna Sikder", "Rafsan Zaman Abir"
RULES = [  # first match wins: (glob, owner text, feature)
  ("app/(onboarding)/*", M, "F1"), ("app/(tabs)/profile/*", M, "F2"), ("features/f1-profile/*", M, "F1"), ("features/f2-profile/*", M, "F2"),
  ("context/ProfileContext.tsx", M, "F1, F2"), ("services/mock/calorie.ts", M, "F1"),
  ("app/(tabs)/workouts/*", S, "F3, F4"), ("app/(tabs)/workouts/session/*", S, "F4"), ("context/WorkoutContext.tsx", S, "F3, F4"),
  ("app/(tabs)/food/*", W, "F5, F6"), ("context/MealsContext.tsx", W, "F5, F6"), ("lib/nutrition.ts", W, "F5, F6"),
  ("services/mock/seed/foods.ts", W, "F5, F6"), ("services/mock/seed/workouts.ts", S, "F3, F4"),
  ("lib/validation.ts", f"{M} (profile rules), {W} (custom food), {R} (weight)", "F1, F6, F7"),
  ("app/(tabs)/home/progress.tsx", R, "F7"), ("app/(tabs)/home/weight-entry.tsx", R, "F7"), ("app/(tabs)/home/weight-history.tsx", R, "F7"),
  ("app/(tabs)/home/water.tsx", R, "F8"), ("context/TrackingContext.tsx", R, "F7, F8"),
  ("services/outbox.ts", f"{R} + {W}", "F8, F6 (task O1)"), ("services/syncHandlers.ts", f"{R} + {W}", "F8, F6 (task O1)"),
  ("hooks/useOutbox.ts", R, "F8"), ("hooks/useNetworkStatus.ts", R, "F8"), ("hooks/useDebounce.ts", W, "F5"),
  ("components/charts.tsx", f"Shared (charts: {R}, ring: {M})", "F7, dashboard"),
  ("tests/*", f"Shared ({M} calorie/validation, others add theirs)", "tests"),
]
SHARED = f"Shared (led by {M})"
rows = []
for root, dirs, files in os.walk("."):
  dirs[:] = [d for d in dirs if d not in ("node_modules", ".expo", ".git", "dist")]
  for f in sorted(files):
    if not f.endswith((".ts", ".tsx")): continue
    p = os.path.join(root, f)[2:]
    owner, feat = SHARED, "shell"
    for g, o, ft in RULES:
      if fnmatch.fnmatch(p, g): owner, feat = o, ft; break
    if p.startswith("features/dashboard") or p == "app/(tabs)/home/index.tsx": feat = "dashboard (shared)"
    src = open(p, encoding="utf-8").read()
    if not src.startswith("// Owner:"):
      open(p, "w", encoding="utf-8").write(f"// Owner: {owner} | {feat}\n" + src)
    rows.append((p, owner, feat))
rows.sort(key=lambda r: (r[1], r[0]))
with open("OWNERS.md", "w", encoding="utf-8") as fh:
  fh.write("# File ownership\n\nEvery `.ts`/`.tsx` file starts with an `// Owner:` line. Re-run `python3 scripts/mark-owners.py` after adding files (edit RULES inside it).\n\n| File | Owner | Feature |\n|---|---|---|\n")
  for p, o, ft in rows: fh.write(f"| `{p}` | {o} | {ft} |\n")
print(len(rows), "files marked")
