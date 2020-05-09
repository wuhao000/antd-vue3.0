<template>
  <code-box :meta="meta">
    <a-checkbox @change="onChange">Checkbox</a-checkbox>
  </code-box>
</template>
<script lang="tsx">
  import CodeBox from '@/views/demo/code-box.vue';
  export default {
    name: 'CheckboxBasicDemo',
    components: {CodeBox},
    setup() {
      return {meta:`####基本用法
简单的checkbox`}
    },
    methods: {
      onChange(e) {
        console.log(`checked = ${e.target.checked}`);
      }
    }
  };
</script>
