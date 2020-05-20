import {getCurrentInstance} from 'vue';

export const useRootFocusBlur = () => {
  const instance = getCurrentInstance();
  return {
    blur: () => {
      if (instance.vnode.el) {
        instance.vnode.el.blur();
      }
    },
    focus: () => {
      if (instance.vnode.el) {
        instance.vnode.el.focus();
      }
    }
  };
};
