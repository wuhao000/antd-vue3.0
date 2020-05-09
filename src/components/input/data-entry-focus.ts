import {ref} from 'vue';

export default () => {
  const elRef = ref(null);
  return {
    focus() {
      elRef.value?.focus();
    },
    blur() {
      elRef.value?.blur();
    },
    setEl(el) {
      elRef.value = el;
    },
    getEl() {
      return elRef?.value;
    }
  };
}
