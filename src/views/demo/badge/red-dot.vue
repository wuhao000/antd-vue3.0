<template>
  <code-box id="components-badge-demo-dot">
    <a-badge dot>
      <a-icon type="notification"/>
    </a-badge>
    <a-badge :count="0" dot>
      <a-icon type="notification"/>
    </a-badge>
    <a-badge dot>
      <a href="#">Link something</a>
    </a-badge>
  </code-box>
</template>
<script>
  export default {
    name: 'BadgeRedDotDemo'
  };
</script>
<style scoped>
  #components-badge-demo-dot .anticon-notification {
    width: 16px;
    height: 16px;
    line-height: 16px;
    font-size: 16px;
  }
</style>
