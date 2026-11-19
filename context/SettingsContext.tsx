// Owner: Shared (led by Mahbub Hasnain) | shell
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Language, Units } from '../lib/types';
import { KEYS, readJson, writeJson } from '../storage/cache';
import { makeT, TFn } from '../i18n';

interface Stored {
  language: Language;
  units: Units;
  reducedMotion: boolean;
  waterGoalMl: number;
}
const DEFAULTS: Stored = { language: 'en', units: 'metric', reducedMotion: true, waterGoalMl: 2500 };

interface Ctx extends Stored {
  ready: boolean;
  t: TFn;
  update: (patch: Partial<Stored>) => void;
  reset: () => void;
}
const SettingsContext = createContext<Ctx | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Stored>(DEFAULTS);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    readJson<Stored>(KEYS.settings, DEFAULTS).then((s) => {
      setState({ ...DEFAULTS, ...s });
      setReady(true);
    });
  }, []);
  const update = useCallback((patch: Partial<Stored>) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      void writeJson(KEYS.settings, next);
      return next;
    });
  }, []);
  const reset = useCallback(() => {
    setState((prev) => {
      const next = { ...DEFAULTS, language: prev.language };
      void writeJson(KEYS.settings, next);
      return next;
    });
  }, []);
  const t = useMemo(() => makeT(state.language), [state.language]);
  const value = useMemo(() => ({ ...state, ready, t, update, reset }), [state, ready, t, update, reset]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const c = useContext(SettingsContext);
  if (!c) throw new Error('SettingsProvider missing');
  return c;
}
