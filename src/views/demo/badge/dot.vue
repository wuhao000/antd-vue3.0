<template>
  <code-box>
    <a-badge status="success"/>
    <a-badge status="error"/>
    <a-badge status="default"/>
    <a-badge status="processing"/>
    <a-badge status="warning"/>
    <br/>
    <a-badge status="success"
             text="Success"/>
    <br/>
    <a-badge status="error"
             text="Error"/>
    <br/>
    <a-badge status="default"
             text="Default"/>
    <br/>
    <a-badge status="processing"
             text="Processing"/>
    <br/>
    <a-badge status="warning"
             text="warning"/>
  </code-box>
</template>
<script>
  import CodeBox from '../code-box';
  export default {
    name: 'BadgeDotDemo',
    components: { CodeBox }
  };
</script>
