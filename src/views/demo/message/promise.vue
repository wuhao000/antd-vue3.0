<template>
  <code-box>
    <a-button @click="success">
      Display a sequence of message
    </a-button>
  </code-box>
</template>
<script lang="ts">
  import {Message} from '@/components';
  import CodeBox from '@/views/demo/code-box.vue';

  export default {
    name: 'messagePromise',
    components: {CodeBox},
    methods: {
      success() {
        Message.loading('Action in progress..', 2.5)
            .then(() => Message.success('Loading finished', 2.5))
            .then(() => Message.info('Loading finished is finished', 2.5));
      }
    }
  };
</script>
