<template>
  <code-box>
    <a-switch loading default-checked/>
    <br/>
    <a-switch size="small" loading/>
  </code-box>
</template>
<script>
  import CodeBox from '../code-box';
  export default {
    name: 'SwitchLoadingDemo',
    components: { CodeBox }
  }
</script>
