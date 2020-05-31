<template>
  <a-table bordered :columns="columns" :components="components" :data-source="data">
    <template v-slot:action>
      <a href="javascript:;">Delete</a>
    </template>
  </a-table>
</template>

<script lang="tsx">
  import VueDraggableResizable from 'vue-draggable-resizable';
  import ResizeableTitle, {columns} from './resizable-title';


  const data = [
    {
      key: 0,
      date: '2018-02-11',
      amount: 120,
      type: 'income',
      note: 'transfer',
    },
    {
      key: 1,
      date: '2018-03-11',
      amount: 243,
      type: 'income',
      note: 'transfer',
    },
    {
      key: 2,
      date: '2018-04-11',
      amount: 98,
      type: 'income',
      note: 'transfer',
    },
  ];

  export default {
    name: 'TableColResizeDemo',
    components: {
      VueDraggableResizable
    },
    data() {
      this.components = {
        header: {
          cell: ResizeableTitle,
        },
      };
      return {
        data,
        columns,
      };
    },
  };
</script>
<style lang="less">
  .resize-table-th {
    position: relative;
    .table-draggable-handle {
      height: 100% !important;
      bottom: 0;
      left: auto !important;
      right: -5px;
      cursor: col-resize;
      touch-action: none;
    }
  }
</style>
