<template>
  <code-box>
    <a-rate v-model:value="value"/>
  </code-box>
</template>
<script lang="tsx">
  import CodeBox from '@/views/demo/code-box.vue';
  import {ref} from 'vue';

  export default {
    name: 'RateBasicDemo',
    components: {CodeBox},
    data() {
      return {
        value: ref(2)
      };
    }
  };
</script>
