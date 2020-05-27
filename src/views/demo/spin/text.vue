<template>
  <code-box>
    <a-spin tip="Loading...">
      <div class="spin-content">
        我的描述文案是自定义的。。。
      </div>
    </a-spin>
  </code-box>
</template>
<script>
  import CodeBox from '../code-box';
  export default {
    name: 'SpinTextDemo',
    components: { CodeBox }
  };
</script>
<style scoped>
  .spin-content {
    border: 1px solid #91d5ff;
    background-color: #e6f7ff;
    padding: 30px;
  }
</style>
