import {ComponentInternalInstance} from '@vue/runtime-core';
import {getCurrentInstance, ref} from 'vue';

function addListener(instance: ComponentInternalInstance, event: string, callback: Function) {
  const originEventListener = instance.attrs[event];
  if (originEventListener) {
    instance.attrs[event] = [originEventListener, callback];
  } else {
    instance.attrs[event] = callback;
  }
}

export const useMouseEvent = () => {
  const instance = getCurrentInstance();
  const onMouseEnter = ref(null);
  const onMouseLeave = ref(null);
  addListener(instance, 'onMouseenter', (...args) => {
    if (onMouseEnter.value) {
      onMouseEnter.value(...args);
    }
  });
  addListener(instance, 'onMouseleave', (...args) => {
    if (onMouseLeave.value) {
      onMouseLeave.value(...args);
    }
  })
  return {onMouseEnter, onMouseLeave};
};
