<template>
  <code-box>
    <a-progress type="circle"
                :percent="75"
                :format="percent => `${percent} Days`"/>
    <a-progress type="circle"
                :percent="100"
                :format="() => 'Done'"/>
    <a-progress type="circle"
                :percent="75">
      <template #format="percent">
        <span style="color: red">{{ percent }}</span>
      </template>
    </a-progress>
  </code-box>
</template>
<script>
  export default {
    name: 'progressText'
  };
</script>
<style scoped>
  div.ant-progress-circle,
  div.ant-progress-line {
    margin-right: 8px;
    margin-bottom: 8px;
  }
</style>
