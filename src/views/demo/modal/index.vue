<template>
  <demo-wrapper>
    <template v-slot:left>
      <modal-basic-demo/>
      <modal-confirm-demo/>
      <modal-footer-demo/>
      <modal-position-demo/>
    </template>
    <template v-slot:right>
      <modal-info-demo/>
    </template>
  </demo-wrapper>
</template>
<script lang="ts">
  import ModalFooterDemo from '@/views/demo/modal/footer.vue';
  import ModalInfoDemo from '@/views/demo/modal/info.vue';
  import ModalPositionDemo from '@/views/demo/modal/position.vue';
  import ModalBasicDemo from './basic.vue';
  import ModalConfirmDemo from './confirm.vue';

  export default {
    components: {ModalInfoDemo, ModalPositionDemo, ModalFooterDemo, ModalConfirmDemo, ModalBasicDemo}
  };
</script>
