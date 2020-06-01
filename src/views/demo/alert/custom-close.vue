<template>
  <code-box>
    <a-alert message="Info Text" type="info" close-text="Close Now" />
  </code-box>
</template>
<script>
  import CodeBox from '../code-box';
  export default {
    name: 'alertCustomClose',
    components: { CodeBox }
  }
</script>
