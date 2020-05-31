<template>
  <demo-wrapper>
    <table-basic-demo/>
    <table-cell-ellipsis-demo/>
    <table-remote-data/>
    <table-bordered-demo/>
    <table-colspan-demo/>
    <table-filter-demo/>
    <table-editable-demo/>
    <table-row-editable-demo/>
    <table-tree-demo/>
    <table-expandable-demo/>
    <table-fixed-demo/>
    <table-fixed-column-demo/>
    <table-fixed-header-demo/>
    <table-header-group-demo/>
    <table-filter-sort-demo/>
    <table-child-demo/>
    <table-filter-sort-control-demo/>
    <table-selection-demo/>
    <table-selection-option-demo/>
    <table-allow-select-demo/>
    <table-size-demo/>
<!--    <table-col-resize-demo/>-->
  </demo-wrapper>
</template>
<script>
  import TableBasicDemo from './basic';
  import TableCellEllipsisDemo from './cell-ellipsis';
  import TableRemoteData from './remote-data';
  import TableBorderedDemo from './bordered';
  import TableColspanDemo from './colspan';
  import TableFilterDemo from './filter';
  import TableEditableDemo from './editable';
  import TableRowEditableDemo from './editable-row';
  import TableTreeDemo from './tree';
  import TableExpandableDemo from './expandable';
  import TableFixedDemo from './fixed';
  import TableFixedColumnDemo from './fixed-col';
  import TableFixedHeaderDemo from './fixed.header';
  import TableHeaderGroupDemo from './header-group';
  import TableFilterSortDemo from './filter-sort';
  import TableChildDemo from './child-table';
  import TableFilterSortControlDemo from './sort-filter-control';
  import TableSelectionDemo from './selection';
  import TableSelectionOptionDemo from './slection-option';
  import TableAllowSelectDemo from './allow-select';
  import TableSizeDemo from './size';
  import TableColResizeDemo from './col-resize';

  export default {
    components: { TableColResizeDemo, TableSizeDemo, TableAllowSelectDemo, TableSelectionOptionDemo, TableSelectionDemo, TableFilterSortControlDemo, TableChildDemo, TableFilterSortDemo, TableHeaderGroupDemo, TableFixedHeaderDemo, TableFixedColumnDemo, TableFixedDemo, TableExpandableDemo, TableTreeDemo, TableRowEditableDemo, TableEditableDemo, TableFilterDemo, TableColspanDemo, TableBorderedDemo, TableRemoteData, TableCellEllipsisDemo, TableBasicDemo }
  };
</script>
