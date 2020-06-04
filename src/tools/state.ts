import {nextTick, reactive} from 'vue';

export const useState = <T extends object = {}>(initState?: T) => {
  const localState = reactive<T>(initState || {} as T);
  const setState = (state, callback?) => {
    const newState = typeof state === 'function' ? state(localState) : state;
    Object.assign(localState, newState);
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
