<template>
  <code-box :meta="meta">
    <a-input placeholder="Basic usage"/>
  </code-box>
</template>
<script lang="tsx">
  import CodeBox from '@/views/demo/code-box.vue';

  export default {
    name: 'BasicInputDemo',
    components: {CodeBox},
    setup() {
      return {
        meta: `#### 基本使用
基本使用`
      };
    }
  };
</script>
