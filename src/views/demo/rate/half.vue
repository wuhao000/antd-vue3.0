<template>
  <code-box>
    <a-rate :default-value="2.5" allow-half/>
  </code-box>
</template>
<script>
  import CodeBox from '../code-box';
  export default {
    name: 'RateHalfDemo',
    components: { CodeBox }
  };
</script>
