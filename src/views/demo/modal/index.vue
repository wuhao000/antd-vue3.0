<template>
  <demo-wrapper>
    <template v-slot:left>
<!--      <modal-basic-demo/>-->
      <modal-confirm-demo/>
    </template>
  </demo-wrapper>
</template>
<script lang="ts">
  import ModalBasicDemo from './basic.vue';
  import ModalConfirmDemo from './confirm.vue';

  export default {
    components: {ModalConfirmDemo, ModalBasicDemo}
  };
</script>
