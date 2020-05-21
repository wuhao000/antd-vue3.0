<template>
  <div>
    <a-button @click="info">
      Info
    </a-button>
    <a-button @click="success">
      Success
    </a-button>
    <a-button @click="error">
      Error
    </a-button>
    <a-button @click="warning">
      Warning
    </a-button>
  </div>
</template>
<script>
  import { h } from 'vue';
  import Modal from '@/components/modal';

  export default {
    name: 'ModalInfoDemo',
    methods: {
      info() {
        Modal.info({
          title: 'This is a notification message',
          content: h('div', {}, [
            h('p', 'some messages...some messages...'),
            h('p', 'some messages...some messages...'),
          ]),
          onOk() {
          },
        });
      },
      success() {
        Modal.success({
          title: 'This is a success message',
          // JSX support
          content: (
              <div>
                <p>some messages...some messages...</p>
                <p>some messages...some messages...</p>
              </div>
          ),
        });
      },

      error() {
        Modal.error({
          title: 'This is an error message',
          content: 'some messages...some messages...',
        });
      },

      warning() {
        Modal.warning({
          title: 'This is a warning message',
          content: 'some messages...some messages...',
        });
      },
    },
  };
</script>
