// Owner: Mahbub Hasnain | F1, F2
import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import type { Profile, ProfileInput, Targets } from '../lib/types';
import { api } from '../services/api';
import { ApiError } from '../services/api/errors';
import { secureToken } from '../storage/secureToken';
import { clearAllCache, KEYS, readJson, writeJson } from '../storage/cache';
import { outbox } from '../services/outbox';

interface State {
  ready: boolean;
  profile: Profile | null;
  targets: Targets | null;
  hasToken: boolean;
}
type Action =
  | { type: 'LOADED'; profile: Profile | null; targets: Targets | null; hasToken: boolean }
  | { type: 'SET'; profile: Profile; targets: Targets; hasToken?: boolean }
  | { type: 'CLEAR' };

const reducer = (s: State, a: Action): State => {
  switch (a.type) {
    case 'LOADED': return { ready: true, profile: a.profile, targets: a.targets, hasToken: a.hasToken };
    case 'SET': return { ...s, profile: a.profile, targets: a.targets, hasToken: a.hasToken ?? s.hasToken };
    case 'CLEAR': return { ready: true, profile: null, targets: null, hasToken: false };
  }
};

interface Ctx extends State {
  onboarded: boolean;
  create: (p: ProfileInput) => Promise<void>;
  update: (patch: Partial<Profile>) => Promise<{ previous: Targets | null; next: Targets }>;
  deleteAll: () => Promise<void>;
}
const ProfileContext = createContext<Ctx | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { ready: false, profile: null, targets: null, hasToken: false });

  useEffect(() => {
    (async () => {
      const cached = await readJson<{ profile: Profile; targets: Targets } | null>(KEYS.profile, null);
      const token = await secureToken.get();
      dispatch({ type: 'LOADED', profile: cached?.profile ?? null, targets: cached?.targets ?? null, hasToken: !!token });
      if (cached && token) {
        try {
          const fresh = await api.profiles.get();
          dispatch({ type: 'SET', ...fresh });
          void writeJson(KEYS.profile, fresh);
        } catch (e) {
          if (e instanceof ApiError && e.status === 401) {
            // token rejected: start again, local data cleared (Flow H)
            await clearAllCache();
            await secureToken.clear();
            dispatch({ type: 'CLEAR' });
          } // otherwise keep cached profile; app works offline
        }
      }
    })();
  }, []);

  const create = useCallback(async (p: ProfileInput) => {
    const res = await api.profiles.create(p); // throws on failure; nothing is saved locally until it succeeds
    await secureToken.set(res.token);
    await writeJson(KEYS.profile, { profile: res.profile, targets: res.targets });
    dispatch({ type: 'SET', profile: res.profile, targets: res.targets, hasToken: true });
  }, []);

  const update = useCallback(
    async (patch: Partial<Profile>) => {
      const previous = state.targets;
      const res = await api.profiles.update(patch); // failure keeps previous values (state untouched)
      await writeJson(KEYS.profile, res);
      dispatch({ type: 'SET', ...res });
      return { previous, next: res.targets };
    },
    [state.targets],
  );

  const deleteAll = useCallback(async () => {
    await api.profiles.remove();
    await outbox.clear();
    await clearAllCache();
    await secureToken.clear();
    dispatch({ type: 'CLEAR' });
  }, []);

  const value = useMemo<Ctx>(
    () => ({ ...state, onboarded: !!state.profile && state.hasToken, create, update, deleteAll }),
    [state, create, update, deleteAll],
  );
  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const c = useContext(ProfileContext);
  if (!c) throw new Error('ProfileProvider missing');
  return c;
}
