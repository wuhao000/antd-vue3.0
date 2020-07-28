<template>
  <code-box>
    <a-button type="primary" @click="openNotification">
      Open the notification box
    </a-button>
  </code-box>
</template>
<script lang="ts">
  import {Notification} from '@/components';
  import CodeBox from '@/views/demo/code-box.vue';
  export default {
    name: 'notificationBasic',
    components: {CodeBox},
    methods: {
      openNotification() {
        Notification.open({
          message: 'Notification Title',
          description:
              'This is the content of the notification. This is the content of the notification. This is the content of the notification.',
          onClick: () => {
            console.log('Notification Clicked!');
          },
        });
      },
    },
  };
</script>
