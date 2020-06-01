<template>
  <code-box>
    <a-button @click="success">
      Customized display duration
    </a-button>
  </code-box>
</template>
<script lang="ts">
  import {Message} from '@/components';
  import CodeBox from '@/views/demo/code-box.vue';

  export default {
    name: 'MessageDuration',
    components: {CodeBox},
    methods: {
      success() {
        Message.success(
            'This is a prompt message for success, and it will disappear in 10 seconds',
            10
        );
      }
    }
  };
</script>
