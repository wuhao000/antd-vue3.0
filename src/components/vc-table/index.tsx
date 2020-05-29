import {useRefs} from '@/components/vc-tabs/src/save-ref';
import {defineComponent, getCurrentInstance} from 'vue';
import {
  camelize,
  getClassFromVNode,
  getEvents,
  getKey,
  getListenersFromInstance,
  getOptionProps,
  getSlotOptions,
  getSlots,
  getStyleFromInstance
} from '../_util/props-util';
import Column from './src/column';
import ColumnGroup from './src/column-group';
// base rc-table 6.10.9
import T from './src/table';
import {INTERNAL_COL_DEFINE} from './src/utils';

const Table = defineComponent({
  name: 'Table',
  Column,
  ColumnGroup,
  props: T.props,
  setup($props, {emit}) {
    const {getRef, saveRef} = useRefs();
    const getTableNode = () => {
      return getRef('table').tableNode;
    };
    const getBodyTable = () => {
      return getRef('table').ref_bodyTable;
    };
    const normalize = (elements = []) => {
      const columns = [];
      elements.forEach(element => {
        if (!element.tag) {
          return;
        }
        const key = getKey(element);
        const style = getStyleFromInstance(element);
        const cls = getClassFromVNode(element);
        const props = getOptionProps(element);
        const events = getEvents(element);
        const listeners = {};
        Object.keys(events).forEach(e => {
          const k = `on-${e}`;
          listeners[camelize(k)] = events[e];
        });
        const {default: children, title} = getSlots(element);
        const column = {title, ...props, style, class: cls, ...listeners};
        if (key) {
          column.key = key;
        }
        if (getSlotOptions(element).isTableColumnGroup) {
          column.children = normalize(typeof children === 'function' ? children() : children);
        } else {
          const customRender =
              element.data && element.data.scopedSlots && element.data.scopedSlots.default;
          column.customRender = column.customRender || customRender;
        }
        columns.push(column);
      });
      return columns;
    };
    return {
      getTableNode,
      getBodyTable,
      normalize,
      saveRef
    };
  },
  render() {
    const instance = getCurrentInstance();
    const {$slots, normalize} = this;
    const props = getOptionProps(instance);
    const columns = props.columns || normalize($slots.default);
    const tProps = {
      ...props,
      columns,
      ...getListenersFromInstance(instance),
      ref: this.saveRef('table')
    };
    return <T {...tProps} />;
  }
});

export default Table;
export {Column, ColumnGroup, INTERNAL_COL_DEFINE};
