<template>
  <code-box>
    <a-button type="primary"
              @click="info">
      Display normal message
    </a-button>
  </code-box>
</template>
<script lang="ts">
  import {Message} from '@/components';
  import CodeBox from '@/views/demo/code-box.vue';

  export default {
    name: 'messageBasic',
    components: {CodeBox},
    methods: {
      info() {
        Message.info('This is a normal message');
      }
    }
  };
</script>
