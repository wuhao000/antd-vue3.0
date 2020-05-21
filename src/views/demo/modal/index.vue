<template>
  <a-modal style="width: 500px;" class="test-class" :visible="true">
    <div>aaaaaaaa</div>
  </a-modal>
</template>
<script lang="tsx">
  import Modal from '@/components/modal';

  export default {
    components: {
      AModal: Modal
    }
  };
</script>
