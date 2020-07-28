<template>
  <code-box>
    <a-alert message="Success Text" type="success" />
  </code-box>
</template>
<script>
  import CodeBox from '../code-box';
  export default {
    name: 'AlertBasic',
    components: { CodeBox }
  }
</script>
