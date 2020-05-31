import {useState, useTable} from '@/components/vc-table/src/table';
import {getTableRowHeight} from '@/components/vc-table/src/utils';
import classNames from 'classnames';
import {CSSProperties, defineComponent} from 'vue';
import {getListenersFromInstance, mergeProps} from '../../_util/props-util';
import PropTypes from '../../_util/vue-types';
import ColGroup from './col-group';
import ExpandableRow from './expandable-row';
import TableHeader from './table-header';
import TableRow from './table-row';

function noop() {
}

const BaseTable = defineComponent({
  name: 'BaseTable',
  props: {
    fixed: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    columns: PropTypes.array.isRequired,
    tableClassName: PropTypes.string.isRequired,
    hasHead: PropTypes.bool.isRequired,
    hasBody: PropTypes.bool.isRequired,
    expander: PropTypes.object.isRequired,
    getRowKey: PropTypes.func,
    isAnyColumnsFixed: PropTypes.bool
  },
  render() {
    const {sComponents: components, prefixCls, scroll, data, getBodyWrapper} = this.table.ctx;
    const {expander, tableClassName, hasHead, hasBody, fixed, isAnyColumnsFixed} = this.$props;

    const tableStyle = {} as CSSProperties;

    if (!fixed && scroll.x) {
      // 当有固定列时，width auto 会导致 body table 的宽度撑不开，从而固定列无法对齐
      // 详情见：https://github.com/ant-design/ant-design/issues/22160
      const tableWidthScrollX = isAnyColumnsFixed ? 'max-content' : 'auto';
      // not set width, then use content fixed width
      tableStyle.width = scroll.x === true ? tableWidthScrollX : scroll.x;
      tableStyle.width =
          typeof tableStyle.width === 'number' ? `${tableStyle.width}px` : tableStyle.width;
    }

    const Table = hasBody ? components.table : 'table';
    const BodyWrapper = components.body.wrapper;

    let body;
    if (hasBody) {
      body = <BodyWrapper class={`${prefixCls}-tbody`}>{this.renderRows(data, 0)}</BodyWrapper>;
      if (getBodyWrapper) {
        body = getBodyWrapper(body);
      }
    }
    const columns = this.getColumns();
    return (
        <table class={tableClassName}
               style={tableStyle}
               key="table">
          <ColGroup columns={columns} fixed={fixed}/>
          {hasHead && <TableHeader expander={expander} columns={columns} fixed={fixed}/>}
          {body}
        </table>
    );
  },
  setup($props) {
    const store = useState();
    const table = useTable();
    const getColumns = (cols?) => {
      const {columns = [], fixed} = $props;
      const {prefixCls} = table.ctx;
      return (cols || columns).map(column => ({
        ...column,
        className:
            !!column.fixed && !fixed
                ? classNames(`${prefixCls}-fixed-columns-in-body`, column.className || column.class)
                : column.className || column.class
      }));
    };
    const handleRowHover = (isHover, key) => {
      store.setState({
        currentHoverKey: isHover ? key : null
      });
    };
    const renderRows = (renderData, indent, ancestorKeys = []) => {
      const {
        columnManager,
        sComponents: components,
        prefixCls,
        childrenColumnName,
        rowClassName,
        customRow = noop
      } = table.ctx;
      const {
        rowClick: onRowClick = noop,
        rowDoubleclick: onRowDoubleClick = noop,
        rowContextmenu: onRowContextMenu = noop,
        rowMouseenter: onRowMouseEnter = noop,
        rowMouseleave: onRowMouseLeave = noop
      } = getListenersFromInstance(table);
      const {getRowKey, fixed, expander, isAnyColumnsFixed} = $props;

      const rows = [];

      for (let i = 0; i < renderData.length; i += 1) {
        const record = renderData[i];
        const key = getRowKey(record, i);
        const className =
            typeof rowClassName === 'string' ? rowClassName : rowClassName(record, i, indent);

        const onHoverProps: any = {};
        if (columnManager.isAnyColumnsFixed()) {
          onHoverProps.onHover = handleRowHover;
        }

        let leafColumns;
        if (fixed === 'left') {
          leafColumns = columnManager.leftLeafColumns();
        } else if (fixed === 'right') {
          leafColumns = columnManager.rightLeafColumns();
        } else {
          leafColumns = getColumns(columnManager.leafColumns());
        }
        const rowPrefixCls = `${prefixCls}-row`;
        const {expandedRowKeys} = store.getState();
        const expandableRowProps = {
          ...expander,
          fixed,
          index: i,
          prefixCls: rowPrefixCls,
          record,
          rowKey: key,
          expanded: expandedRowKeys.includes(key),
          needIndentSpaced: expander.needIndentSpaced,
          key,
          onRowClick,
          onExpandedChange: expander.handleExpandChange
        };
        const row = <ExpandableRow slots={{
          default: expandableRow => {
            const tableRowProps = mergeProps(
                {
                  fixed,
                  indent,
                  record,
                  index: i,
                  hovered: store.getState().currentHoverKey === key,
                  prefixCls: rowPrefixCls,
                  childrenColumnName,
                  columns: leafColumns,
                  rowKey: key,
                  height: getTableRowHeight(store.getState(), {fixed: $props.fixed, rowKey: key}),
                  ancestorKeys,
                  components,
                  isAnyColumnsFixed,
                  customRow,
                  onRowDoubleclick: onRowDoubleClick,
                  onRowContextmenu: onRowContextMenu,
                  onRowMouseenter: onRowMouseEnter,
                  onRowMouseleave: onRowMouseLeave,
                  ...onHoverProps,
                  class: className,
                  ref: `row_${i}_${indent}`
                },
                expandableRow
            );
            return <TableRow {...tableRowProps} />;
          }
        }} {...expandableRowProps} />;
        rows.push(row);
        expander.renderRows(renderRows, rows, record, i, indent, fixed, key, ancestorKeys);
      }
      return rows;
    };


    return {
      getColumns,
      handleRowHover,
      renderRows,
      table
    };
  }
}) as any;

export default BaseTable;
