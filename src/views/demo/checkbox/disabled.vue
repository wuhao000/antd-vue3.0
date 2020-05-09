<template>
  <code-box :meta="meta">
    <a-checkbox :defaultChecked="false" disabled/>
    <br/>
    <a-checkbox defaultChecked disabled/>
  </code-box>
</template>
<script>
  import CodeBox from '@/views/demo/code-box';

  export default {
    components: { CodeBox },
    setup() {
      return {
        meta: `####不可用
checkbox 不可用`
      };
    }
  };
</script>
