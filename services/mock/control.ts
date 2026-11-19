// Owner: Shared (led by Mahbub Hasnain) | shell
/** Demo switch so evaluators can see offline, error and sync behaviour without a server. */
type L = () => void;
const state = { offline: false };
const listeners = new Set<L>();
export const mockControl = {
  isOffline: () => state.offline,
  setOffline(v: boolean) {
    state.offline = v;
    listeners.forEach((l) => l());
  },
  subscribe(l: L) {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
};
