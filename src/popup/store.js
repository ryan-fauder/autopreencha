/**
 * Padrão Observer: estado único do popup. Quem precisa reagir (renderização, persistência) assina com
 * subscribe() e recebe o estado novo e o anterior a cada mudança.
 */
export function createStore(initialState) {
  let state = initialState;
  const listeners = new Set();
  return {
    getState: () => state,
    setState(patch) {
      const previous = state;
      state = { ...state, ...patch };
      for (const listener of listeners) listener(state, previous);
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
