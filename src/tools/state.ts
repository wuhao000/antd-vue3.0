import {nextTick, reactive} from 'vue';

export const useState = <T extends object = {}>() => {
  const state = reactive<T>({} as T);
  const setState = (newState, callback?) => {
    if (newState) {
      Object.keys(newState).forEach(key => {
        state[key] = newState[key];
      });
    }
    if (callback) {
      nextTick(() => {
        callback();
      });
    }
    return state;
  };
  return {
    createState(data: T) {
      return setState(data);
    },
    setState,
    state
  };
};
