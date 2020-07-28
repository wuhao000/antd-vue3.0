import {addListener} from '@/components/_util/vnode';
import {getCurrentInstance, ref} from 'vue';


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
  });
  return {onMouseEnter, onMouseLeave};
};
