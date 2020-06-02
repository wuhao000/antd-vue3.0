<template>
  <code-box>
    <a-progress type="circle"
                :percent="30"
                :width="80"/>
    <a-progress type="circle"
                :percent="70"
                :width="80"
                status="exception"/>
    <a-progress type="circle"
                :percent="100"
                :width="80"/>
  </code-box>
</template>
<script>
  export default {
    name: 'progressSmallCircle'
  };
</script>
<style scoped>
  .ant-progress-circle-wrap,
  .ant-progress-line-wrap {
    margin-right: 8px;
    margin-bottom: 5px;
  }
</style>
