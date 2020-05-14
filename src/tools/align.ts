import {alignElement} from 'dom-align';
import {onUpdated, Ref, nextTick} from 'vue';


export const useAlign = (source: Ref, target: Ref, align: any) => {
  onUpdated(() => {
    nextTick(() => {
      if (source.value && target.value) {
        alignElement(source.value, target.value, align);
      }
    });
  });
};
