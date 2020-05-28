<template>
  <code-box>
    <a-pagination v-model:current="current"
                  :total="50" show-less-items/>
  </code-box>
</template>
<script>
  import CodeBox from '@/views/demo/code-box';

  export default {
    name: 'PaginationBasicDemo',
    components: { CodeBox },
    data() {
      return {
        current: 2
      };
    }
  };
</script>
