<template>
  <code-box meta="####基本
简单的徽章展示，当 count 为 0 时，默认不显示，但是可以使用 showZero 修改为显示。">
    <a-badge count="5">
      <a href="#"
         class="head-example"/>
    </a-badge>
    <a-badge count="0" show-zero>
      <a href="#"
         class="head-example"/>
    </a-badge>
    <a-badge>
      <template v-slot:count>
        <a-icon type="clock-circle"
                style="color: #f5222d"/>
      </template>

      <a href="#"
         class="head-example"/>
    </a-badge>
  </code-box>
</template>
<script lang="ts">
  export default {
    name: 'BadgeBasicDemo'
  };
</script>
