import {getListenersFromInstance} from '@/components/_util/props-util';
import {defineComponent, getCurrentInstance, onBeforeUnmount, onMounted, ref} from 'vue';
import PropTypes from '../_util/vue-types';

import {Store} from './create-store';

const BodyRowProps = {
  store: Store,
  rowKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  prefixCls: PropTypes.string
};

export default function createBodyRow(Component = 'tr') {
  const BodyRow = defineComponent({
    name: 'BodyRow',
    props: BodyRowProps,
    setup($props, {emit}) {
      const unsubscribe = ref(undefined);
      const {selectedRowKeys} = $props.store.getState();
      const selected = ref(selectedRowKeys.indexOf($props.rowKey) >= 0);
      const subscribe = () => {
        const {store, rowKey} = $props;
        unsubscribe.value = store.subscribe(() => {
          const {selectedRowKeys} = store.getState();
          const selectedV = selectedRowKeys.indexOf(rowKey) >= 0;
          if (selectedV !== selected.value) {
            selected.value = selectedV;
          }
        });
      };
      onMounted(() => {
        subscribe();
      });
      onBeforeUnmount(() => {
        if (unsubscribe.value) {
          unsubscribe.value();
        }
      });

      return {
        subscribe,
        selected
      };
    },
    render(ctx) {
      const instance = getCurrentInstance();
      const className = {
        [`${this.prefixCls}-row-selected`]: this.selected
      };
      return (
          <Component class={className} {...getListenersFromInstance(instance)}>
            {this.$slots.default}
          </Component>
      );
    }
  });

  return BodyRow;
}
