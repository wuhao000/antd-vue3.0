<template>
  <code-box>
    <a-button @click="showConfirm">
      Confirm
    </a-button>
  </code-box>
</template>
<script>
  import Modal from '../../../components/modal';
  import CodeBox from '@/views/demo/code-box';
  export default {
    name: 'ModalConfirmDemo',
    components: { CodeBox },
    methods: {
      showConfirm() {
        console.log('clicked')
        Modal.confirm({
          title: 'Do you want to delete these items?',
          content: 'When clicked the OK button, this dialog will be closed after 1 second',
          onOk() {
            return new Promise((resolve, reject) => {
              setTimeout(Math.random() > 0.5 ? resolve : reject, 1000);
            }).catch(() => console.log('Oops errors!'));
          },
          onCancel() {},
        });
      },
    },
  };
</script>
