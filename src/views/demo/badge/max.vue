<template>
  <code-box>
    <a-badge :count="99">
      <a href="#"
         class="head-example"/>
    </a-badge>
    <a-badge :count="100">
      <a href="#"
         class="head-example"/>
    </a-badge>
    <a-badge :count="99"
             :overflow-count="10">
      <a href="#"
         class="head-example"/>
    </a-badge>
    <a-badge :count="1000"
             :overflow-count="999">
      <a href="#"
         class="head-example"/>
    </a-badge>
  </code-box>
</template>
<script>
  import CodeBox from '../code-box';
  export default {
    name: 'BadgeMaxNumberDemo',
    components: { CodeBox }
  };
</script>
