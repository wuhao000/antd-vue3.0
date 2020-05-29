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
import Base from '../base';
import T from './table';

const Table = defineComponent({
  name: 'ATable',
  Column: T.Column,
  ColumnGroup: T.ColumnGroup,
  props: T.props,
  setup($props, {emit, slots}) {
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
        const {default: children, ...restSlots} = getSlots(element);
        const column = {...restSlots, ...props, style, class: cls, ...listeners};
        if (key) {
          column.key = key;
        }
        if (getSlotOptions(element).__ANT_TABLE_COLUMN_GROUP) {
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
    const updateColumns = (cols = []) => {
      const columns = [];
      cols.forEach(
          col => {
            const {slots: colSlots = {}, ...restProps} = col;
            const column = {
              ...restProps
            };
            Object.keys(colSlots).forEach(key => {
              const name = colSlots[key];
              if (column[key] === undefined && slots[name]) {
                column[key] = slots[name].length === 1 ? slots[name][0] : slots[name];
              }
            });
            // if (slotScopeName && $scopedSlots[slotScopeName]) {
            //   column.customRender = column.customRender || $scopedSlots[slotScopeName]
            // }
            if (col.children) {
              column.children = updateColumns(column.children);
            }
            columns.push(column);
          });
      return columns;
    };


    return {
      normalize,
      updateColumns
    };
  },
  render(ctx) {
    const instance = getCurrentInstance();
    const {$slots, normalize} = ctx;
    const columns = ctx.columns ? this.updateColumns(ctx.columns) : normalize($slots.default);
    let {title, footer} = ctx;
    const {
      title: slotTitle,
      footer: slotFooter,
      expandedRowRender = ctx.expandedRowRender
    } = $slots;
    title = title || slotTitle;
    footer = footer || slotFooter;
    const tProps = {
      ...ctx,
      columns,
      title,
      footer,
      expandedRowRender,
      ...getListenersFromInstance(instance)
    };
    return <T {...tProps} />;
  }
});
/* istanbul ignore next */
Table.install = function(Vue) {
  Vue.use(Base);
  Vue.component(Table.name, Table);
  Vue.component(Table.Column.name, Table.Column);
  Vue.component(Table.ColumnGroup.name, Table.ColumnGroup);
};

export default Table;
