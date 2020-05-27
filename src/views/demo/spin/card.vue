<template>
  <code-box>
    <a-spin :spinning="spinning">
      <div class="spin-content">
        可以点击‘切换’按钮，控制本区域的spin展示。
      </div>
    </a-spin>
    Loading state：
    <a-switch v-model:value="spinning"/>
  </code-box>
</template>
<script>
  import CodeBox from '../code-box';
  export default {
    name: 'SpinCardDemo',
    components: { CodeBox },
    data() {
      return {
        spinning: false
      };
    },
    methods: {
      changeSpinning() {
        this.spinning = !this.spinning;
      }
    }
  };
</script>
<style scoped>
  .spin-content {
    border: 1px solid #91d5ff;
    background-color: #e6f7ff;
    padding: 30px;
  }
</style>
