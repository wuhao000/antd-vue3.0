import {useLocalStore} from '@/components/vc-table/src/table';
import shallowEqual from 'shallowequal';
import {defineComponent, getCurrentInstance, nextTick, onMounted, onUpdated, ref, watch} from 'vue';
import {getListenersFromInstance, getOptionProps, initDefaultProps} from '../../_util/props-util';
import PropTypes from '../../_util/vue-types';
import TableRow from './table-row';
import {getTableRowHeight, remove} from './utils';

export const ExpandableTableProps = () => ({
  expandIconAsCell: PropTypes.bool,
  expandRowByClick: PropTypes.bool,
  expandedRowKeys: PropTypes.array,
  expandedRowClassName: PropTypes.func,
  defaultExpandAllRows: PropTypes.bool,
  defaultExpandedRowKeys: PropTypes.array,
  expandIconColumnIndex: PropTypes.number,
  expandedRowRender: PropTypes.func,
  expandIcon: PropTypes.func,
  childrenColumnName: PropTypes.string,
  indentSize: PropTypes.number,
  // onExpand: PropTypes.func,
  // onExpandedRowsChange: PropTypes.func,
  columnManager: PropTypes.object.isRequired,
  prefixCls: PropTypes.string.isRequired,
  data: PropTypes.array,
  getRowKey: PropTypes.func
});

const ExpandableTable = defineComponent({
  name: 'ExpandableTable',
  inheritAttrs: false,
  props: initDefaultProps(ExpandableTableProps(), {
    expandIconAsCell: false,
    expandedRowClassName: () => () => '',
    expandIconColumnIndex: 0,
    defaultExpandAllRows: false,
    defaultExpandedRowKeys: [],
    childrenColumnName: 'children',
    indentSize: 15
  }),
  setup($props, {emit}) {
    const store = useLocalStore();
    watch(() => $props.expandedRowKeys, (val) => {
      nextTick(() => {
        store.setState({
          expandedRowKeys: val
        });
      });
    });
    {
      const {
        data,
        childrenColumnName,
        defaultExpandAllRows,
        expandedRowKeys,
        defaultExpandedRowKeys,
        getRowKey
      } = $props;

      let finalExpandedRowKeys = [];
      let rows = [...data];

      if (defaultExpandAllRows) {
        for (let i = 0; i < rows.length; i += 1) {
          const row = rows[i];
          finalExpandedRowKeys.push(getRowKey(row, i));
          rows = rows.concat(row[childrenColumnName] || []);
        }
      } else {
        finalExpandedRowKeys = expandedRowKeys || defaultExpandedRowKeys;
      }

      store.setState({
        expandedRowsHeight: {},
        expandedRowKeys: finalExpandedRowKeys
      });
    }
    const latestExpandedRows = ref(undefined);
    const handleUpdated = () => {
      // We should record latest expanded rows to avoid multiple rows remove cause `onExpandedRowsChange` trigger many times
      latestExpandedRows.value = null;
    };
    const handleExpandChange = (expanded, record, event, rowKey, destroy = false) => {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      let {expandedRowKeys} = store.getState();
      // console.log(expanded);
      // console.log(record);
      // console.log(event);
      // console.log(rowKey);
      // console.log(destroy);
      if (expanded) {
        // row was expaned
        expandedRowKeys = [...expandedRowKeys, rowKey];
      } else {
        // row was collapse
        const expandedRowIndex = expandedRowKeys.indexOf(rowKey);
        if (expandedRowIndex !== -1) {
          expandedRowKeys = remove(expandedRowKeys, rowKey);
        }
      }
      if (!$props.expandedRowKeys) {
        store.setState({expandedRowKeys});
      }
      // De-dup of repeat call
      if (!latestExpandedRows.value || !shallowEqual(latestExpandedRows.value, expandedRowKeys)) {
        latestExpandedRows.avlue = expandedRowKeys;
        emit('expandedRowsChange', expandedRowKeys);
      }

      if (!destroy) {
        emit('expand', expanded, record);
      }
    };
    const renderExpandIndentCell = (rows, fixed) => {
      const {prefixCls, expandIconAsCell} = $props;
      if (!expandIconAsCell || fixed === 'right' || !rows.length) {
        return;
      }
      const iconColumn = {
        key: 'rc-table-expand-icon-cell',
        className: `${prefixCls}-expand-icon-th`,
        title: '',
        rowSpan: rows.length
      };
      rows[0].unshift({...iconColumn, column: iconColumn});
    };
    const renderExpandedRow = (record, index, expandedRowRender, className, ancestorKeys, indent, fixed) => {
      const {prefixCls, expandIconAsCell, indentSize} = $props;
      const parentKey = ancestorKeys[ancestorKeys.length - 1];
      const rowKey = `${parentKey}-extra-row`;
      const components = {
        body: {
          row: 'tr',
          cell: 'td'
        }
      };
      let colCount;
      if (fixed === 'left') {
        colCount = $props.columnManager.leftLeafColumns().length;
      } else if (fixed === 'right') {
        colCount = $props.columnManager.rightLeafColumns().length;
      } else {
        colCount = $props.columnManager.leafColumns().length;
      }
      const columns = [
        {
          key: 'extra-row',
          customRender: () => {
            const {expandedRowKeys} = store.getState();
            const expanded = expandedRowKeys.includes(parentKey);
            return {
              colSpan: colCount,
              children:
                  fixed !== 'right' ? expandedRowRender(record, index, indent, expanded) : '&nbsp;'
            };
          }
        }
      ];
      if (expandIconAsCell && fixed !== 'right') {
        columns.unshift({
          key: 'expand-icon-placeholder',
          customRender: () => null
        });
      }
      return (
          <TableRow
              key={rowKey}
              columns={columns}
              class={className}
              rowKey={rowKey}
              ancestorKeys={ancestorKeys}
              hovered={store.getState().currentHoverKey === rowKey}
              prefixCls={`${prefixCls}-expanded-row`}
              indentSize={indentSize}
              height={getTableRowHeight(store.getState(), {fixed: $props.fixed, rowKey})}
              indent={indent}
              fixed={fixed}
              components={components}
              expandedRow={true}
              hasExpandIcon={() => {
              }}
          />
      );
    };
    const renderRows = (renderRows, rows, record, index, indent, fixed, parentKey, ancestorKeys) => {
      const {expandedRowClassName, expandedRowRender, childrenColumnName} = $props;
      const childrenData = record[childrenColumnName];
      const nextAncestorKeys = [...ancestorKeys, parentKey];
      const nextIndent = indent + 1;

      if (expandedRowRender) {
        rows.push(
            renderExpandedRow(
                record,
                index,
                expandedRowRender,
                expandedRowClassName(record, index, indent),
                nextAncestorKeys,
                nextIndent,
                fixed
            )
        );
      }

      if (childrenData) {
        rows.push(...renderRows(childrenData, nextIndent, nextAncestorKeys));
      }
    };
    onMounted(() => {
      handleUpdated();
    });
    onUpdated(() => {
      handleUpdated();
    });

    return {
      handleUpdated,
      handleExpandChange,
      renderExpandIndentCell,
      renderExpandedRow,
      renderRows
    };
  },
  render() {
    const instance = getCurrentInstance();
    const {data, childrenColumnName, $slots} = this;
    const props = getOptionProps(instance);
    const needIndentSpaced = data.some(record => record[childrenColumnName]);
    return (
        $slots.default &&
        $slots.default({
          ...props,
          ...getListenersFromInstance(instance),
          needIndentSpaced,
          renderRows: this.renderRows,
          handleExpandChange: this.handleExpandChange,
          renderExpandIndentCell: this.renderExpandIndentCell
        })
    );
  }
});

export default ExpandableTable;
