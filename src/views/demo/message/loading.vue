<template>
  <code-box>
    <a-button @click="success">
      Display a loading indicator
    </a-button>
  </code-box>
</template>
<script lang="ts">
  import {Message} from '@/components';
  import CodeBox from '@/views/demo/code-box.vue';

  export default {
    name: 'MessageLoading',
    components: {CodeBox},
    methods: {
      success() {
        const hide = Message.loading('Action in progress..', 0);
        setTimeout(hide, 2500);
      }
    }
  };
</script>
