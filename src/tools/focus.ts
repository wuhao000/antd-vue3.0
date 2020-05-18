import {getCurrentInstance} from 'vue';

export const useRootFocusBlur = () => {
  const instance = getCurrentInstance();
  return {
    blur: () => {
      instance.vnode.el?.blur();
    },
    focus: () => {
      instance.vnode.el?.focus();
    }
  };
};
