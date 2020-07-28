<template>
  <code-box>
    <a-progress :percent="30" />
    <a-progress :percent="50"
                status="active" />
    <a-progress :percent="70"
                status="exception" />
    <a-progress :percent="100" />
    <a-progress :percent="50"
                :show-info="false" />
  </code-box>
</template>
<script>
  import CodeBox from '@/views/demo/code-box';
  export default {
    name: 'ProgressBasic',
    components: { CodeBox }
  };
</script>
