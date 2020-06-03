import {getListenersFromInstance} from '@/components/_util/props-util';
import {useLocalStore} from '@/components/vc-table/src/table';
import {defineComponent, getCurrentInstance, onBeforeUnmount, onMounted, ref} from 'vue';
import PropTypes from '../_util/vue-types';

const BodyRowProps = {
  rowKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  prefixCls: PropTypes.string
};

export default function createBodyRow(Component = 'tr') {
  const BodyRow = defineComponent({
    name: 'BodyRow',
    props: BodyRowProps,
    setup($props, {emit}) {
      const store = useLocalStore();
      const {selectedRowKeys} = store.getState();
      const selected = ref(selectedRowKeys.indexOf($props.rowKey) >= 0);
      return {
        selected
      };
    },
    render() {
      const instance = getCurrentInstance();
      const className = {
        [`${this.prefixCls}-row-selected`]: this.selected
      };
      return (
          <Component class={className} {...getListenersFromInstance(instance)}>
            {this.$slots.default && this.$slots.default()}
          </Component>
      );
    }
  });

  return BodyRow;
}
