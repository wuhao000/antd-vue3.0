<template>
  <demo-wrapper>
    <basic-demo/>
    <custom-demo/>
  </demo-wrapper>
</template>
<script lang="ts">
  import BasicDemo from './basic.vue';
  import CustomDemo from './custom.vue';
  export default {
    components: {
      BasicDemo,
      CustomDemo
    }
  }
</script>
