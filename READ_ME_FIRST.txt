SHOKTI FIT - UPLOAD INSTRUCTIONS FOR SHUVRATA BANIK SHUVO
=====================================================
This zip contains F3 (workout library with level and no-equipment filters) and F4 (workout detail, active session with timer, pause, rest and stop confirmation, session history), with their state and workout seed data.

Upload order: After Mahbub's base is on main.
Everything is inside the folder  mobile/  so it matches the repo layout in the TRD (mobile/ and server/).
Do NOT commit this text file. Repo: https://github.com/ShuvoBanik/Shokti_Fit

IMPORTANT
- Files in the four zips never overlap, so they merge without conflicts.
- The app only builds and runs once ALL FOUR zips are merged (the app shell imports every feature).
  Do not worry if your part alone does not run: that is expected.
- Commit as yourself (git config user.name / user.email must be your own GitHub name and email),
  so the history shows who wrote what.

STEPS (terminal, recommended)
1. Unzip this file. You get a folder  mobile/.
2. Get the repo and (if it is not main yet) switch:
     git clone https://github.com/ShuvoBanik/Shokti_Fit
     cd Shokti_Fit
3. Wait until Mahbub's base is on main, then:
     git pull origin main
     git checkout -b feature/F3-F4-workouts
     cp -r /path/to/unzipped/mobile/. ./mobile/       (Windows: copy the folders into Shokti_Fit/mobile, keep the folder structure)
git add services/mock/seed/workouts.ts "app/(tabs)/workouts/_layout.tsx" "app/(tabs)/workouts/index.tsx" "app/(tabs)/workouts/[id].tsx"
git commit -m "feat(F3): workout seed data and library screen"

git add context/WorkoutContext.tsx "app/(tabs)/workouts/session" "app/(tabs)/workouts/history.tsx"
git commit -m "feat(F4): active session, session state and history"
     git push -u origin feature/F3-F4-workouts
4. On GitHub open a pull request from feature/F3-F4-workouts into main and ask a teammate who did not write
   this code to approve it (plan section 6.1). Mahbub reviews shared-shell changes.
5. After all four parts are merged: git pull origin main, then
     cd mobile
     npm install
     npx expo start

ALTERNATIVE: upload from the GitHub website
- Open the repo, Add file > Upload files, and drag the contents of mobile/ in (keep the folder structure).
- GitHub's web upload accepts at most 100 files at a time, which is fine for this zip (7 files).
- Choose "Create a new branch" (feature/F3-F4-workouts) and open a pull request.
  (The web uploader does not let you split commits per feature; the terminal steps above do.)

YOUR FILES (7)
  mobile/app/(tabs)/workouts/[id].tsx
  mobile/app/(tabs)/workouts/_layout.tsx
  mobile/app/(tabs)/workouts/history.tsx
  mobile/app/(tabs)/workouts/index.tsx
  mobile/app/(tabs)/workouts/session/[id].tsx
  mobile/context/WorkoutContext.tsx
  mobile/services/mock/seed/workouts.ts
