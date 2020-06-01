<template>
  <code-box>
    <a-button @click="success">
      Success
    </a-button>
    <a-button @click="error">
      Error
    </a-button>
    <a-button @click="warning">
      Warning
    </a-button>
  </code-box>
</template>
<script lang="ts">
  import {Message} from '@/components';
  import CodeBox from '@/views/demo/code-box.vue';
  export default {
    name: 'MessageType',
    components: {CodeBox},
    methods: {
      success() {
        Message.success('This is a success message');
      },
      error() {
        Message.error('This is an error message');
      },
      warning() {
        Message.warning('This is a warning message');
      },
    },
  };
</script>
