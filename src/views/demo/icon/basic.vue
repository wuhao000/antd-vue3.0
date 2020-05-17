<template>
  <code-box :meta="meta">
    <div class="icons-list">
      <a-icon type="home"/>
      <a-icon type="setting"
              theme="filled"/>
      <a-icon type="smile"
              theme="outlined"/>
      <a-icon type="sync" spin/>
      <a-icon type="smile"
              :rotate="180"/>
      <a-icon type="loading"/>
    </div>
  </code-box>
</template>
<script lang="ts">
  export default {
    setup() {
      return {
        meta: `####基本用法
使用 <Icon/> 标签声明组件，指定图标对应的 type 属性。可以通过 theme 属性来设置不同的主题风格的图标，也可以通过设置 spin 属性来实现动画旋转效果。`
      };
    }
  } as any;
</script>
<style scoped>
  .icons-list >>> .anticon {
    margin-right: 6px;
    font-size: 24px;
  }
</style>
