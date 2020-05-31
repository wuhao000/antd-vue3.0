import {useState, useTable} from '@/components/vc-table/src/table';
import PropTypes from '../../_util/vue-types';
import TableHeaderRow from './table-header-row';
import { defineComponent } from 'vue';

function getHeaderRows({ columns = [], currentRow = 0, rows = [], isLast = true }) {
  const copyRows = rows || [];
  copyRows[currentRow] = copyRows[currentRow] || [];

  columns.forEach((column, i) => {
    if (column.rowSpan && copyRows.length < column.rowSpan) {
      while (copyRows.length < column.rowSpan) {
        copyRows.push([]);
      }
    }
    const cellIsLast = isLast && i === columns.length - 1;
    const cell: any = {
      key: column.key,
      className: column.className || column.class || '',
      children: column.title,
      isLast: cellIsLast,
      column
    };
    if (column.children) {
      getHeaderRows({
        columns: column.children,
        currentRow: currentRow + 1,
        rows: copyRows,
        isLast: cellIsLast
      });
    }
    if ('colSpan' in column) {
      cell.colSpan = column.colSpan;
    }
    if ('rowSpan' in column) {
      cell.rowSpan = column.rowSpan;
    }
    if (cell.colSpan !== 0) {
      copyRows[currentRow].push(cell);
    }
  });
  return copyRows.filter(row => row.length > 0);
}

export default defineComponent({
  name: 'TableHeader',
  props: {
    fixed: PropTypes.string,
    columns: PropTypes.array.isRequired,
    expander: PropTypes.object.isRequired
  },
  setup(props) {
    const store = useState();
    return {
      table: useTable(),
      getRowHeight(rows: any[]) {
        const { fixedColumnsHeadRowsHeight } = store.getState();
        const { columns, fixed } = props;
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
    };
  },
  render(ctx) {
    const { sComponents: components, prefixCls, showHeader, customHeaderRow } = this.table.ctx;
    const { expander, columns, fixed } = ctx;

    if (!showHeader) {
      return null;
    }

    const rows = getHeaderRows({ columns });

    expander.renderExpandIndentCell(rows, fixed);

    const HeaderWrapper = components.header.wrapper;

    return (
      <HeaderWrapper class={`${prefixCls}-thead`}>
        {rows.map((row, index) => (
          <TableHeaderRow
            prefixCls={prefixCls}
            height={this.getRowHeight(rows)}
            key={index}
            index={index}
            fixed={fixed}
            columns={columns}
            rows={rows}
            row={row}
            components={components}
            customHeaderRow={customHeaderRow}
          />
        ))}
      </HeaderWrapper>
    );
  }
}) as any;
