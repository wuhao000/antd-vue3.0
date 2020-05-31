import {defineComponent, onBeforeUnmount, ref} from 'vue';
import PropTypes from '../../_util/vue-types';
import ExpandIcon from './expand-icon';

const ExpandableRow = defineComponent({
  name: 'ExpandableRow',
  inheritAttrs: false,
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
    const expandable = ref(false);
    const tempExpandIconAsCell = ref($props.expandIconAsCell);
    const tempExpandIconColumnIndex = ref(null);
    const hasExpandIcon = (columnIndex) => {
      const {expandRowByClick, expandIcon} = $props;
      if (tempExpandIconAsCell.value || columnIndex !== tempExpandIconColumnIndex.value) {
        return false;
      }
      return !!expandIcon || !expandRowByClick;
    };
    const handleExpandChange = (record, event) => {
      const {expanded, rowKey} = $props;
      emit('expandedChange', !expanded, record, event, rowKey);
    };
    const handleDestroy = () => {
      const {rowKey, record} = $props;
      emit('expandedChange', false, record, null, rowKey, true);
    };
    const handleRowClick = (record, index, event) => {
      const {expandRowByClick} = $props;
      if (expandRowByClick) {
        handleExpandChange(record, event);
      }
      emit('rowClick', record, index, event);
    };
    const renderExpandIcon = () => {
      const {prefixCls, expanded, record, needIndentSpaced, expandIcon} = $props;
      if (expandIcon) {
        return expandIcon({
          prefixCls,
          expanded,
          record,
          needIndentSpaced,
          expandable: expandable.value,
          onExpand: handleExpandChange
        });
      }
      return (
          <ExpandIcon
              expandable={expandable.value}
              prefixCls={prefixCls}
              onExpand={handleExpandChange}
              needIndentSpaced={needIndentSpaced}
              expanded={expanded}
              record={record}
          />
      );
    };
    const renderExpandIconCell = (cells) => {
      if (!tempExpandIconAsCell.value) {
        return;
      }
      const {prefixCls} = $props;
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
      renderExpandIconCell,
      tempExpandIconAsCell,
      setTempExpandIconAsCell(val) {
        tempExpandIconAsCell.value = val;
      },
      setTempExpandIconColumnIndex(val) {
        tempExpandIconColumnIndex.value = val;
      },
      setExpandable(val) {
        expandable.value = val;
      }
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
    this.setTempExpandIconAsCell(fixed === 'right' ? false : this.expandIconAsCell);
    this.setTempExpandIconColumnIndex(fixed === 'right' ? -1 : this.expandIconColumnIndex);
    const childrenData = record[childrenColumnName];
    this.setExpandable(!!(childrenData || expandedRowRender));
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
}) as any;

export default ExpandableRow;
