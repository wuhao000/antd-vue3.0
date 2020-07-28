<template>
  <div>
    <a-pagination
        show-size-changer
        :default-current="3"
        :total="500"
        @showSizeChange="onShowSizeChange"
    />
    <br />
    <a-pagination
        v-model:value="current"
        show-size-changer
        :page-size.sync="pageSize"
        :total="500"
        disabled
        @showSizeChange="onShowSizeChange"
    />
  </div>
</template>
<script>
  export default {
    name: 'PaginationChangeDemo',
    data() {
      return {
        pageSize: 20,
        current: 4,
      };
    },
    watch: {
      pageSize(val) {
        console.log('pageSize', val);
      },
      current(val) {
        console.log('current', val);
      },
    },
    methods: {
      onShowSizeChange(current, pageSize) {
        console.log(current, pageSize);
      },
    },
  };
</script>
