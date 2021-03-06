import classNames from 'classnames';
import {defineComponent} from 'vue';
import {mergeProps} from '../../_util/props-util';
import PropTypes from '../../_util/vue-types';

const TableHeaderRow = defineComponent({
  props: {
    index: PropTypes.number,
    fixed: PropTypes.string,
    columns: PropTypes.array,
    rows: PropTypes.array,
    row: PropTypes.array,
    components: PropTypes.object,
    height: PropTypes.any,
    customHeaderRow: PropTypes.func,
    prefixCls: PropTypes.string
  },
  name: 'TableHeaderRow',
  render() {
    const {row, index, height, components, customHeaderRow, prefixCls} = this;
    const HeaderRow = components.header.row;
    const HeaderCell = components.header.cell;
    const rowProps = customHeaderRow(
        row.map(cell => cell.column),
        index
    );
    const customStyle = rowProps ? rowProps.style : {};
    const style = {height, ...customStyle};
    if (style.height === null) {
      delete style.height;
    }
    return (
        <HeaderRow {...rowProps} style={style}>
          {row.map((cell, i) => {
            const {column, isLast, children, className, ...cellProps} = cell;
            const customProps = column.customHeaderCell ? column.customHeaderCell(column) : {};
            const headerCellProps = mergeProps({
                  ...cellProps
                },
                {
                  ...customProps,
                  key: column.key || column.dataIndex || i
                }
            );

            if (column.align) {
              headerCellProps.style = {...customProps.style, textAlign: column.align};
            }

            headerCellProps.class = classNames(
                customProps.class,
                customProps.className,
                column.class,
                column.className,
                {
                  [`${prefixCls}-align-${column.align}`]: !!column.align,
                  [`${prefixCls}-row-cell-ellipsis`]: !!column.ellipsis,
                  [`${prefixCls}-row-cell-break-word`]: !!column.width,
                  [`${prefixCls}-row-cell-last`]: isLast
                }
            );

            if (typeof HeaderCell === 'function') {
              return HeaderCell(headerCellProps, children);
            }
            return <HeaderCell {...headerCellProps}>{children}</HeaderCell>;
          })}
        </HeaderRow>
    );
  }
}) as any;

function getRowHeight(state, props) {
  const {fixedColumnsHeadRowsHeight} = state;
  const {columns, rows, fixed} = props;
  const headerHeight = fixedColumnsHeadRowsHeight[0];

  if (!fixed) {
    return null;
  }

  if (headerHeight && columns) {
    if (headerHeight === 'auto') {
      return 'auto';
    }
    return `${headerHeight / rows.length}px`;
  }
  return null;
}

export default TableHeaderRow;
