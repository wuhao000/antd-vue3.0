<template>
  <code-box>
    <a-button type="primary"
              @click="openMessage">
      Open the message box
    </a-button>
  </code-box>
</template>
<script lang="ts">
  import {Message} from '@/components';
  import CodeBox from '@/views/demo/code-box.vue';

  const key = 'updatable';
  export default {
    name: 'messageUpdateContent',
    components: {CodeBox},
    methods: {
      openMessage() {
        Message.loading({content: 'Loading...', key});
        setTimeout(() => {
          Message.success({content: 'Loaded!', key, duration: 2});
        }, 1000);
      }
    }
  };
</script>
