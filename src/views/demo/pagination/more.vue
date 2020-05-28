<template>
  <code-box>
    <a-pagination :default-current="6"
                  :total="500"/>
  </code-box>
</template>
<script>
  import CodeBox from '../code-box';
  export default {
    name: 'PaginationMoreDemo',
    components: { CodeBox }
  };
</script>
