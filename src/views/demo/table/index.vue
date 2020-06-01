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
  </demo-wrapper>
</template>
<script lang="ts">
  import TableAllowSelectDemo from './allow-select.vue';
  import TableBasicDemo from './basic.vue';
  import TableBorderedDemo from './bordered.vue';
  import TableCellEllipsisDemo from './cell-ellipsis.vue';
  import TableChildDemo from './child-table.vue';
  import TableColspanDemo from './colspan.vue';
  import TableRowEditableDemo from './editable-row.vue';
  import TableEditableDemo from './editable.vue';
  import TableExpandableDemo from './expandable.vue';
  import TableFilterSortDemo from './filter-sort.vue';
  import TableFilterDemo from './filter.vue';
  import TableFixedColumnDemo from './fixed-col.vue';
  import TableFixedHeaderDemo from './fixed.header.vue';
  import TableFixedDemo from './fixed.vue';
  import TableHeaderGroupDemo from './header-group.vue';
  import TableRemoteData from './remote-data.vue';
  import TableSelectionDemo from './selection.vue';
  import TableSizeDemo from './size.vue';
  import TableSelectionOptionDemo from './slection-option.vue';
  import TableFilterSortControlDemo from './sort-filter-control.vue';
  import TableTreeDemo from './tree.vue';

  export default {
    components: {
      TableColResizeDemo,
      TableSizeDemo,
      TableAllowSelectDemo,
      TableSelectionOptionDemo,
      TableSelectionDemo,
      TableFilterSortControlDemo,
      TableChildDemo,
      TableFilterSortDemo,
      TableHeaderGroupDemo,
      TableFixedHeaderDemo,
      TableFixedColumnDemo,
      TableFixedDemo,
      TableExpandableDemo,
      TableTreeDemo,
      TableRowEditableDemo,
      TableEditableDemo,
      TableFilterDemo,
      TableColspanDemo,
      TableBorderedDemo,
      TableRemoteData,
      TableCellEllipsisDemo,
      TableBasicDemo
    }
  };
</script>
