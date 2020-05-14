// based on vc-align 2.4.5
import {placements} from '@/components/vc-tooltip/placements';
import {alignElement} from 'dom-align';
import Align from './align';
import {onUpdated, Ref, VNode} from 'vue';

export default Align;


export const useAlign = (ref: Ref, target: Ref, placement: string, shouldAlign: (...args: any[]) => boolean) => {
  onUpdated(() => {
    if (shouldAlign == undefined || shouldAlign()) {
      if (ref.value && target.value) {
        alignElement(ref.value, target.value, placements[placement]);
      }
    }
  });
};
