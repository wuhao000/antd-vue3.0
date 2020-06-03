import {nextTick, reactive} from 'vue';

export const useState = <T extends object = {}>() => {
  const state = reactive<T>({});
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
  };
  return {
    createState(data: T) {
      setState(data);
    },
    setState,
    state
  };
};
