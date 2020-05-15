<template>
  <demo-wrapper>
    <menu-top-demo/>
    <menu-left-demo/>
  </demo-wrapper>
</template>
<script lang="ts">
  import MenuLeftDemo from '@/views/demo/menu/left.vue';
  import MenuTopDemo from '@/views/demo/menu/top.vue';
  import {ref} from 'vue';

  export default {
    components: {MenuLeftDemo, MenuTopDemo}
  };
</script>
