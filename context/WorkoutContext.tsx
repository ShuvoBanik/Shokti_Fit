// Owner: Shuvrata Banik Shuvo | F3, F4
import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import type { Session, SessionSet, Workout } from '../lib/types';
import { uuid } from '../lib/dates';
import { api } from '../services/api';
import { ApiError } from '../services/api/errors';
import { outbox } from '../services/outbox';
import { useProfile } from './ProfileContext';
import { useSettings } from './SettingsContext';
import { useSnackbar } from './SnackbarContext';

export interface ActiveSession {
  clientId: string;
  workout: Workout;
  startedAt: string;
  exerciseIdx: number;
  setNo: number; // 1-based within the current exercise
  sets: SessionSet[];
  paused: boolean;
  elapsedMs: number;
  restMs: number;
  lastTick: number;
  finished?: { status: 'completed' | 'partial'; durationSeconds: number };
}
type Action =
  | { type: 'START'; workout: Workout; clientId: string; now: number }
  | { type: 'TICK'; now: number }
  | { type: 'COMPLETE_SET' }
  | { type: 'PAUSE' }
  | { type: 'RESUME'; now: number }
  | { type: 'SKIP_REST' }
  | { type: 'STOP' }
  | { type: 'DISMISS' };

const repsOf = (reps: string) => parseInt(reps, 10) || 0;

function reducer(s: ActiveSession | null, a: Action): ActiveSession | null {
  if (a.type === 'START') {
    return { clientId: a.clientId, workout: a.workout, startedAt: new Date(a.now).toISOString(), exerciseIdx: 0, setNo: 1, sets: [], paused: false, elapsedMs: 0, restMs: 0, lastTick: a.now };
  }
  if (a.type === 'DISMISS') return null;
  if (!s || s.finished) return s;
  switch (a.type) {
    case 'TICK': {
      const dt = Math.max(0, a.now - s.lastTick);
      if (s.paused) return { ...s, lastTick: a.now };
      return { ...s, lastTick: a.now, elapsedMs: s.elapsedMs + dt, restMs: Math.max(0, s.restMs - dt) };
    }
    case 'PAUSE': return { ...s, paused: true };
    case 'RESUME': return { ...s, paused: false, lastTick: a.now };
    case 'SKIP_REST': return { ...s, restMs: 0 };
    case 'COMPLETE_SET': {
      if (s.restMs > 0) return s;
      const ex = s.workout.exercises[s.exerciseIdx];
      const set: SessionSet = { exerciseId: ex.id, setNumber: s.setNo, repsDone: repsOf(ex.reps), weightKg: ex.targetKg, completed: true };
      const sets = [...s.sets, set];
      const lastSet = s.setNo >= ex.sets;
      const lastExercise = s.exerciseIdx >= s.workout.exercises.length - 1;
      if (lastSet && lastExercise) {
        return { ...s, sets, finished: { status: 'completed', durationSeconds: Math.round(s.elapsedMs / 1000) } };
      }
      if (lastSet) return { ...s, sets, exerciseIdx: s.exerciseIdx + 1, setNo: 1, restMs: ex.restSeconds * 1000 };
      return { ...s, sets, setNo: s.setNo + 1, restMs: ex.restSeconds * 1000 };
    }
    case 'STOP': return { ...s, finished: { status: 'partial', durationSeconds: Math.round(s.elapsedMs / 1000) } };
  }
  return s;
}

interface Ctx {
  active: ActiveSession | null;
  isRunning: boolean;
  history: Session[];
  historyStatus: 'idle' | 'loading' | 'error';
  loadHistory: () => Promise<void>;
  start: (w: Workout) => string;
  tick: () => void;
  completeSet: () => void;
  pause: () => void;
  resume: () => void;
  skipRest: () => void;
  stop: () => void;
  dismiss: () => void;
}
const WorkoutContext = createContext<Ctx | null>(null);

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const [active, dispatch] = useReducer(reducer, null);
  const [server, setServer] = useState<Session[]>([]);
  const [local, setLocal] = useState<Session[]>([]);
  const [historyStatus, setHistoryStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const { onboarded } = useProfile();
  const { t } = useSettings();
  const snack = useSnackbar();
  const saved = useRef(new Set<string>());

  const loadHistory = useCallback(async () => {
    setHistoryStatus('loading');
    try {
      const list = await api.sessions.list();
      setServer(list);
      const queued = new Set(outbox.snapshot().filter((i) => i.type === 'session.save').map((i) => i.payload.clientId as string));
      setLocal((l) => l.filter((s) => queued.has(s.clientId) && !list.some((x) => x.clientId === s.clientId)));
      setHistoryStatus('idle');
    } catch {
      setHistoryStatus('error');
    }
  }, []);

  useEffect(() => {
    if (onboarded) void loadHistory();
  }, [onboarded, loadHistory]);

  useEffect(() => {
    let prev = outbox.snapshot().filter((i) => i.type === 'session.save').length;
    return outbox.subscribe(() => {
      const n = outbox.snapshot().filter((i) => i.type === 'session.save').length;
      if (n < prev) void loadHistory();
      prev = n;
    });
  }, [loadHistory]);

  // Persist once when a session ends (completed or partial). Never blocks the UI.
  useEffect(() => {
    if (!active?.finished || saved.current.has(active.clientId)) return;
    saved.current.add(active.clientId);
    const payload = {
      clientId: active.clientId, workoutId: active.workout.id, startedAt: active.startedAt,
      endedAt: new Date().toISOString(), status: active.finished.status, durationSeconds: active.finished.durationSeconds, sets: active.sets,
    };
    const localSession: Session = {
      id: `local-${active.clientId}`, clientId: active.clientId, workoutId: active.workout.id, workoutName: active.workout.nameEn,
      status: payload.status, startedAt: payload.startedAt, endedAt: payload.endedAt, durationSeconds: payload.durationSeconds,
      sets: active.sets, exercisesCount: active.workout.exercises.length,
    };
    setLocal((l) => [...l, localSession]);
    (async () => {
      try {
        const s = await api.sessions.start({ clientId: payload.clientId, workoutId: payload.workoutId, startedAt: payload.startedAt });
        await api.sessions.finish(s.id, payload);
        await loadHistory();
      } catch (e) {
        if (e instanceof ApiError && !e.isNetwork) {
          snack.show({ kind: 'error', text: e.message });
          return;
        }
        await outbox.enqueue('session.save', payload, undefined, payload.clientId);
        snack.show({ kind: 'info', text: t('snack.sessionQueued') });
      }
    })();
  }, [active, loadHistory, snack, t]);

  const start = useCallback((w: Workout) => {
    const clientId = uuid();
    dispatch({ type: 'START', workout: w, clientId, now: Date.now() });
    // POST /api/sessions with status in_progress; if it fails the session still runs locally (Flow C).
    void api.sessions.start({ clientId, workoutId: w.id, startedAt: new Date().toISOString() }).catch(() => {});
    return clientId;
  }, []);
  const tick = useCallback(() => dispatch({ type: 'TICK', now: Date.now() }), []);

  const history = useMemo(() => {
    const merged = [...server, ...local.filter((l) => !server.some((s) => s.clientId === l.clientId))];
    return merged.sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  }, [server, local]);

  const value = useMemo<Ctx>(
    () => ({
      active, isRunning: !!active && !active.finished, history, historyStatus, loadHistory, start, tick,
      completeSet: () => dispatch({ type: 'COMPLETE_SET' }),
      pause: () => dispatch({ type: 'PAUSE' }),
      resume: () => dispatch({ type: 'RESUME', now: Date.now() }),
      skipRest: () => dispatch({ type: 'SKIP_REST' }),
      stop: () => dispatch({ type: 'STOP' }),
      dismiss: () => dispatch({ type: 'DISMISS' }),
    }),
    [active, history, historyStatus, loadHistory, start, tick],
  );
  return <WorkoutContext.Provider value={value}>{children}</WorkoutContext.Provider>;
}

export function useWorkout() {
  const c = useContext(WorkoutContext);
  if (!c) throw new Error('WorkoutProvider missing');
  return c;
}
