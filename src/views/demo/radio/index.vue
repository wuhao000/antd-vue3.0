<template>
  <demo-wrapper>
    <template v-slot:left>
      <basic-radio-demo/>
      <radio-group-demo/>
      <vertical-radio-group-demo/>
    </template>
  </demo-wrapper>
</template>
<script lang="tsx">
  import BasicRadioDemo from '@/views/demo/radio/basic.vue';
  import RadioGroupDemo from '@/views/demo/radio/group.vue';
  import VerticalRadioGroupDemo from '@/views/demo/radio/vertical.vue';

  export default {
    components: {VerticalRadioGroupDemo, RadioGroupDemo, BasicRadioDemo}
  };
</script>
