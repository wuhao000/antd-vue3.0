import {alignElement} from 'dom-align';
import {isVNode, nextTick, onUpdated, Ref} from 'vue';

function getEl(target) {
  if (!target) {
    return undefined;
  }
  if (isVNode(target)) {
    return target.el;
  }
  if (target.$el) {
    return target.$el;
  }
  return target;
}

export const useAlign = (source: Ref, target: Ref, align: any) => {
  onUpdated(() => {
    nextTick(() => {
      if (source.value && target.value) {
        alignElement(getEl(source.value), getEl(target.value), align);
      }
    });
  });
};
