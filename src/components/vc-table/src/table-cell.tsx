import {useTable} from '@/components/vc-table/src/table';
import classNames from 'classnames';
import get from 'lodash/get';
import {defineComponent} from 'vue';
import {isValidElement, mergeProps} from '../../_util/props-util';
import PropTypes from '../../_util/vue-types';

function isInvalidRenderCellText(text) {
  return (
      text && !isValidElement(text) && Object.prototype.toString.call(text) === '[object Object]'
  );
}

export default defineComponent({
  name: 'TableCell',
  props: {
    record: PropTypes.object,
    prefixCls: PropTypes.string,
    index: PropTypes.number,
    indent: PropTypes.number,
    indentSize: PropTypes.number,
    column: PropTypes.object,
    expandIcon: PropTypes.any,
    component: PropTypes.any
  },
  setup($props) {
    const handleClick = (e) => {
      const {
        record,
        column: {onCellClick}
      } = $props;
      if (onCellClick) {
        onCellClick(record, e);
      }
    };
    return {
      handleClick,
      table: useTable()
    };
  },
  render() {
    const {
      record,
      indentSize,
      prefixCls,
      indent,
      index,
      expandIcon,
      column,
      component: BodyCell
    } = this;
    const {dataIndex, customRender, className = ''} = column;
    const {transformCellText} = this.table.ctx;
    // We should return undefined if no dataIndex is specified, but in order to
    // be compatible with object-path's behavior, we return the record object instead.
    let text;
    if (typeof dataIndex === 'number') {
      text = get(record, dataIndex);
    } else if (!dataIndex || dataIndex.length === 0) {
      text = record;
    } else {
      text = get(record, dataIndex);
    }
    let tdProps: any = {
      onClick: this.handleClick
    };
    let colSpan;
    let rowSpan;

    if (customRender) {
      text = customRender(text, record, index, column);
      if (isInvalidRenderCellText(text)) {
        Object.assign(tdProps, text);
        colSpan = tdProps.colSpan;
        rowSpan = tdProps.rowSpan;
        text = text.children;
      }
    }

    if (column.customCell) {
      tdProps = mergeProps(tdProps, column.customCell(record, index));
    }

    // Fix https://github.com/ant-design/ant-design/issues/1202
    if (isInvalidRenderCellText(text)) {
      text = null;
    }

    if (transformCellText) {
      text = transformCellText({text, column, record, index});
    }

    const indentText = expandIcon ? (
        <span style={{paddingLeft: `${indentSize * indent}px`}}
              class={`${prefixCls}-indent indent-level-${indent}`}
        />
    ) : null;

    if (rowSpan === 0 || colSpan === 0) {
      return null;
    }
    if (column.align) {
      tdProps.style = {textAlign: column.align, ...tdProps.style};
    }

    const cellClassName = classNames(className, column.class, {
      [`${prefixCls}-cell-ellipsis`]: !!column.ellipsis,
      // 如果有宽度，增加断行处理
      // https://github.com/ant-design/ant-design/issues/13825#issuecomment-449889241
      [`${prefixCls}-cell-break-word`]: !!column.width
    });

    if (column.ellipsis) {
      if (typeof text === 'string') {
        tdProps.title = text;
      }
    }

    return (
        <BodyCell class={cellClassName} {...tdProps}>
          {indentText}
          {expandIcon}
          {text}
        </BodyCell>
    );
  }
}) as any;
