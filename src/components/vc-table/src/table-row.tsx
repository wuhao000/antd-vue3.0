import {useState} from '@/components/vc-table/src/table';
import classNames from 'classnames';
import {computed, defineComponent, getCurrentInstance, nextTick, onMounted, onUpdated, ref, watch} from 'vue';
import {getStyleFromInstance, initDefaultProps, mergeProps} from '../../_util/props-util';
import PropTypes from '../../_util/vue-types';
import warning from '../../_util/warning';
import TableCell from './table-cell';

function noop(...args: any[]) {
}

const TableRow = defineComponent({
  name: 'TableRow',
  props: initDefaultProps(
      {
        customRow: PropTypes.func,
        // onRowClick: PropTypes.func,
        // onRowDoubleClick: PropTypes.func,
        // onRowContextMenu: PropTypes.func,
        // onRowMouseEnter: PropTypes.func,
        // onRowMouseLeave: PropTypes.func,
        record: PropTypes.object,
        prefixCls: PropTypes.string,
        // onHover: PropTypes.func,
        columns: PropTypes.array,
        height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        index: PropTypes.number,
        rowKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        className: PropTypes.string,
        indent: PropTypes.number,
        indentSize: PropTypes.number,
        hasExpandIcon: PropTypes.func,
        hovered: PropTypes.bool.isRequired,
        visible: PropTypes.bool.isRequired,
        fixed: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
        renderExpandIcon: PropTypes.func,
        renderExpandIconCell: PropTypes.func,
        components: PropTypes.any,
        expandedRow: PropTypes.bool,
        isAnyColumnsFixed: PropTypes.bool,
        ancestorKeys: PropTypes.array.isRequired,
        expandIconColumnIndex: PropTypes.number,
        expandRowByClick: PropTypes.bool
        // visible: PropTypes.bool,
        // hovered: PropTypes.bool,
        // height: PropTypes.any,
      },
      {
        // expandIconColumnIndex: 0,
        // expandRowByClick: false,
        hasExpandIcon: () => () => {
        },
        renderExpandIcon: () => () => {
        },
        renderExpandIconCell: () => () => {
        }
      }
  ),
  watch: {
    visible(val) {
      if (val) {
        this.shouldRender = true;
      }
    }
  },
  setup($props, {emit}) {
    const store = useState();
    const visible = computed(() => {
      const {currentHoverKey, expandedRowKeys} = store.getState();
      const {rowKey, ancestorKeys} = $props;
      return ancestorKeys.length === 0 || ancestorKeys.every(k => expandedRowKeys.includes(k));
    });
    const shouldRender = ref(visible.value);
    watch(() => visible.value, () => {
      shouldRender.value = true;
    });
    const onRowClick = (event, rowPropFunc = noop) => {
      const {record, index} = $props;
      emit('rowClick', record, index, event);
      rowPropFunc(event);
    };
    const onRowDoubleClick = (event, rowPropFunc = noop) => {
      const {record, index} = $props;
      emit('rowDoubleClick', record, index, event);
      rowPropFunc(event);
    };
    const onContextMenu = (event, rowPropFunc = noop) => {
      const {record, index} = $props;
      emit('rowContextmenu', record, index, event);
      rowPropFunc(event);
    };
    const onMouseEnter = (event, rowPropFunc = noop) => {
      const {record, index, rowKey} = $props;
      emit('hover', true, rowKey);
      emit('rowMouseenter', record, index, event);
      rowPropFunc(event);
    };
    const onMouseLeave = (event, rowPropFunc = noop) => {
      const {record, index, rowKey} = $props;
      emit('hover', false, rowKey);
      emit('rowMouseleave', record, index, event);
      rowPropFunc(event);
    };
    const setExpandedRowHeight = () => {
      const {rowKey} = $props;
      let {expandedRowsHeight} = store.getState();
      const height = rowRef.value.getBoundingClientRect().height;
      expandedRowsHeight = {
        ...expandedRowsHeight,
        [rowKey]: height
      };
      store.setState({expandedRowsHeight});
    };
    const setRowHeight = () => {
      const {rowKey} = $props;
      const {fixedColumnsBodyRowsHeight} = store.getState();
      const height = rowRef.value.getBoundingClientRect().height;
      store.setState({
        fixedColumnsBodyRowsHeight: {
          ...fixedColumnsBodyRowsHeight,
          [rowKey]: height
        }
      });
    };
    const instance = getCurrentInstance();
    const getStyle = () => {
      const {height} = $props;
      let style: any = getStyleFromInstance(instance);
      if (height) {
        style = {...style, height};
      }

      if (!visible.value && !style.display) {
        style = {...style, display: 'none'};
      }

      return style;
    };
    const rowRef = ref(undefined);
    const saveRowRef = () => {
      rowRef.value = instance.vnode.el;

      const {isAnyColumnsFixed, fixed, expandedRow, ancestorKeys} = $props;

      if (!isAnyColumnsFixed) {
        return;
      }

      if (!fixed && expandedRow) {
        setExpandedRowHeight();
      }

      if (!fixed && ancestorKeys.length >= 0) {
        setRowHeight();
      }
    };
    onMounted(() => {
      if (shouldRender.value) {
        nextTick(() => {
          saveRowRef();
        });
      }
    });
    onUpdated(() => {
      if (shouldRender.value && !rowRef.value) {
        nextTick(() => {
          saveRowRef();
        });
      }
    });

    return {
      onRowClick,
      onRowDoubleClick,
      onContextMenu,
      onMouseEnter,
      onMouseLeave,
      setExpandedRowHeight,
      setRowHeight,
      getStyle,
      saveRowRef,
      shouldRender,
      visible
    };
  },
  render() {
    if (!this.shouldRender) {
      return null;
    }
    const {
      prefixCls,
      columns,
      record,
      rowKey,
      index,
      customRow = noop,
      indent,
      indentSize,
      hovered,
      height,
      visible,
      components,
      hasExpandIcon,
      renderExpandIcon,
      renderExpandIconCell
    } = this;
    const BodyRow = components.body.row;
    const BodyCell = components.body.cell;

    let className = '';

    if (hovered) {
      className += ` ${prefixCls}-hover`;
    }

    const cells = [];

    renderExpandIconCell(cells);

    for (let i = 0; i < columns.length; i += 1) {
      const column = columns[i];

      warning(
          column.onCellClick === undefined,
          'column[onCellClick] is deprecated, please use column[customCell] instead.'
      );
      cells.push(
          <TableCell
              prefixCls={prefixCls}
              record={record}
              indentSize={indentSize}
              indent={indent}
              index={index}
              column={column}
              key={column.key || column.dataIndex}
              expandIcon={hasExpandIcon(i) && renderExpandIcon()}
              component={BodyCell}
          />
      );
    }

    const {class: customClass, className: customClassName, style: customStyle, ...rowProps} =
    customRow(record, index) || {};
    let style = {height: typeof height === 'number' ? `${height}px` : height} as CSSStyleDeclaration;

    if (!visible) {
      style.display = 'none';
    }

    style = {...style, ...customStyle};
    const rowClassName = classNames(
        prefixCls,
        className,
        `${prefixCls}-level-${indent}`,
        customClassName,
        customClass
    );
    const rowPropEvents = rowProps.on || {};
    const bodyRowProps = mergeProps(
        {
          ...rowProps,
          style
        },
        {
          onClick: e => {
            this.onRowClick(e, rowPropEvents.click);
          },
          onDblclick: e => {
            this.onRowDoubleClick(e, rowPropEvents.dblclick);
          },
          onMouseenter: e => {
            this.onMouseEnter(e, rowPropEvents.mouseenter);
          },
          onMouseleave: e => {
            this.onMouseLeave(e, rowPropEvents.mouseleave);
          },
          onContextmenu: e => {
            this.onContextMenu(e, rowPropEvents.contextmenu);
          },
          class: rowClassName
        },
        {
          'data-row-key': rowKey
        }
    );
    return <BodyRow {...bodyRowProps}>{cells}</BodyRow>;
  }
});

function getRowHeight(state, props) {
  const {expandedRowsHeight, fixedColumnsBodyRowsHeight} = state;
  const {fixed, rowKey} = props;

  if (!fixed) {
    return null;
  }

  if (expandedRowsHeight[rowKey]) {
    return expandedRowsHeight[rowKey];
  }

  if (fixedColumnsBodyRowsHeight[rowKey]) {
    return fixedColumnsBodyRowsHeight[rowKey];
  }

  return null;
}

export default TableRow;
// export default connect((state, props) => {
//   const { currentHoverKey, expandedRowKeys } = state;
//   const { rowKey, ancestorKeys } = props;
//   const visible = ancestorKeys.length === 0 || ancestorKeys.every(k => expandedRowKeys.includes(k));
//
//   return {
//     visible,
//     hovered: currentHoverKey === rowKey,
//     height: getRowHeight(state, props),
//   };
// })(TableRow);
