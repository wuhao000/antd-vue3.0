<template>
  <code-box>
    <a-switch default-checked/>
    <br/>
    <a-switch size="small" default-checked/>
  </code-box>
</template>
<script>
  import CodeBox from '../code-box';
  export default {
    name: 'SwitchSizeDemo',
    components: { CodeBox }
  }
</script>
