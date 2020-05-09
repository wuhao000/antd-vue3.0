<template>
  <code-box>
    <a-input placeholder="input with clear icon" :allow-clear="true" @change="onChange"/>
    <br/>
    <br/>
    <a-textarea placeholder="textarea with clear icon" allowClear @change="onChange"/>
  </code-box>
</template>
<script lang="tsx">
  import CodeBox from '@/views/demo/code-box.vue';
  import {defineComponent} from 'vue';

  export default defineComponent({
    name: 'InputClearDemo',
    components: {CodeBox},
    setup() {
      return {
        onChange: (e) => {
        }
      };
    }
  });
</script>
