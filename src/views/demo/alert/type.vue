<template>
  <code-box>
    <a-alert message="Success Text"
             type="success"/>
    <a-alert message="Info Text"
             type="info"/>
    <a-alert message="Warning Text"
             type="warning"/>
    <a-alert message="Error Text"
             type="error"/>
  </code-box>
</template>
<script>
  import CodeBox from '../code-box';
  export default {
    name: 'AlertType',
    components: { CodeBox }
  }
</script>
