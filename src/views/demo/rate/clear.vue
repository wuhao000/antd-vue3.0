<template>
  <code-box>
    <a-rate :default-value="3"/>
    <span class="ant-rate-text">allowClear: true</span>
    <br/>
    <a-rate :allow-clear="false"
            :default-value="3"/>
    <span class="ant-rate-text">allowClear: false</span>
  </code-box>
</template>
<script>
  import CodeBox from '../code-box';
  export default {
    name: 'RateClearDemo',
    components: { CodeBox }
  };
</script>
