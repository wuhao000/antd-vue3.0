<template>
  <code-box :meta="meta">
    <a-radio>Radio</a-radio>
  </code-box>
</template>
<script>
  import CodeBox from '@/views/demo/code-box';
  export default {
    name: 'BasicRadioDemo',
    components: { CodeBox },
    setup() {
      return `####基本
最简单的用法。`
    }
  };
</script>
