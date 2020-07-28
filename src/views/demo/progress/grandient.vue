<template>
  <code-box>
    <a-progress :stroke-color="{
        '0%' : '#108ee9',
        '100%' : '#87d068',
      }"
                :percent="99.9"
    />
    <a-progress :stroke-color="{
        from : '#108ee9',
        to : '#87d068',
      }"
                :percent="99.9"
                status="active"
    />
    <a-progress type="circle"
                :stroke-color="{
        '0%' : '#108ee9',
        '100%' : '#87d068',
      }"
                :percent="90"
    />
    <a-progress type="circle"
                :stroke-color="{
        '0%' : '#108ee9',
        '100%' : '#87d068',
      }"
                :percent="100"
    />
  </code-box>
</template>
<script>
  import CodeBox from '@/views/demo/code-box';
  export default {
    name: 'progressGrandient',
    components: { CodeBox }
  };
</script>
