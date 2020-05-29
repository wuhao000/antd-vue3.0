import {defineComponent, onBeforeUnmount} from 'vue';
import PropTypes from '../../_util/vue-types';
import ExpandIcon from './expand-icon';

const ExpandableRow = defineComponent({
  name: 'ExpandableRow',
  props: {
    prefixCls: PropTypes.string.isRequired,
    rowKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    fixed: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    record: PropTypes.oneOfType([PropTypes.object, PropTypes.array]).isRequired,
    indentSize: PropTypes.number,
    needIndentSpaced: PropTypes.bool.isRequired,
    expandRowByClick: PropTypes.bool,
    expanded: PropTypes.bool.isRequired,
    expandIconAsCell: PropTypes.bool,
    expandIconColumnIndex: PropTypes.number,
    childrenColumnName: PropTypes.string,
    expandedRowRender: PropTypes.func,
    expandIcon: PropTypes.func
    // onExpandedChange: PropTypes.func.isRequired,
    // onRowClick: PropTypes.func,
    // children: PropTypes.func.isRequired,
  },
  setup($props, {emit}) {

    const hasExpandIcon = (columnIndex) => {
      const {expandRowByClick, expandIcon} = $props;

      if (tempExpandIconAsCell || columnIndex !== tempExpandIconColumnIndex) {
        return false;
      }

      return !!expandIcon || !expandRowByClick;
    };
    const handleExpandChange = (record, event) => {
      const {expanded, rowKey} = this;
      __emit('expandedChange', !expanded, record, event, rowKey);
    };
    const handleDestroy = () => {
      const {rowKey, record} = this;
      __emit('expandedChange', false, record, null, rowKey, true);
    };
    const handleRowClick = (record, index, event) => {
      const {expandRowByClick} = this;
      if (expandRowByClick) {
        handleExpandChange(record, event);
      }
      __emit('rowClick', record, index, event);
    };
    const renderExpandIcon = () => {
      const {prefixCls, expanded, record, needIndentSpaced, expandIcon} = this;
      if (expandIcon) {
        return expandIcon({
          prefixCls,
          expanded,
          record,
          needIndentSpaced,
          expandable: expandable,
          onExpand: handleExpandChange
        });
      }
      return (
          <ExpandIcon
              expandable={expandable}
              prefixCls={prefixCls}
              onExpand={handleExpandChange}
              needIndentSpaced={needIndentSpaced}
              expanded={expanded}
              record={record}
          />
      );
    };
    const renderExpandIconCell = (cells) => {
      if (!tempExpandIconAsCell) {
        return;
      }
      const {prefixCls} = this;

      cells.push(
          <td class={`${prefixCls}-expand-icon-cell`} key="rc-table-expand-icon-cell">
            {renderExpandIcon()}
          </td>
      );
    };
    onBeforeUnmount(() => {
      handleDestroy();
    });

    return {
      hasExpandIcon,
      handleExpandChange,
      handleDestroy,
      handleRowClick,
      renderExpandIcon,
      renderExpandIconCell
    };
  },
  render() {
    const {
      childrenColumnName,
      expandedRowRender,
      indentSize,
      record,
      fixed,
      $slots: slots,
      expanded
    } = this;

    this.tempExpandIconAsCell = fixed !== 'right' ? this.expandIconAsCell : false;
    this.tempExpandIconColumnIndex = fixed !== 'right' ? this.expandIconColumnIndex : -1;
    const childrenData = record[childrenColumnName];
    this.expandable = !!(childrenData || expandedRowRender);
    const expandableRowProps = {
      indentSize,
      expanded, // not used in TableRow, but it's required to re-render TableRow when `expanded` changes
      hasExpandIcon: this.hasExpandIcon,
      renderExpandIcon: this.renderExpandIcon,
      renderExpandIconCell: this.renderExpandIconCell,
      onRowClick: this.handleRowClick
    };
    return slots.default && slots.default(expandableRowProps);
  }
});

export default ExpandableRow;
