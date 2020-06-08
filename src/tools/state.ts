import {nextTick, reactive} from 'vue';

export const useState = <T extends object = {}>(initialState?: T | (() => T)) => {
  // @ts-ignore
  const initState = (typeof initialState === 'function' ? initialState() : initialState) || {} as T;
  const localState = reactive<T>(initState);
  const setState = (state, callback?) => {
    const newState = typeof state === 'function' ? state(localState) : state;
    Object.keys(newState).forEach(key => {
      localState[key] = newState[key];
    });
    nextTick(() => {
      callback && callback();
    });
    return localState;
  };
  return {
    createState(data: T) {
      return setState(data);
    },
    setState,
    state: localState
  };
};
