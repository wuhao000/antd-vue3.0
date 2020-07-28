import {reactive} from 'vue';
import {Store} from './index';

export default function create<T extends object>(initialState: T) {
  const state = reactive(initialState);

  function setState(partial: T) {
    if (partial) {
      Object.keys(partial).forEach(key => {
        state[key] = partial[key];
      });
    }
  }

  function getState(): T {
    return state as T;
  }

  return {
    setState,
    getState,
  } as Store;
}
