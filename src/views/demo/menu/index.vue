<template>
  <demo-wrapper>
    <menu-top-demo/>
    <transition-demo/>
  </demo-wrapper>
</template>
<script lang="ts">
  import MenuTopDemo from '@/views/demo/menu/top.vue';
  import {ref} from 'vue';
  import TransitionDemo from './transition';

  export default {
    components: {MenuTopDemo, TransitionDemo},
    setup() {
      return {
        show: ref(false)
      };
    }
  };
</script>
