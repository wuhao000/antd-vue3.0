import {ref} from 'vue';

export const useRef = () => {
  const refEl = ref(undefined);
  return {
    ref: refEl,
    setRef(el) {
      refEl.value = el;
    },
    getRef() {
      return refEl.value;
    }
  };
};
