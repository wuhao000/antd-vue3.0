<template>
  <code-box>
    <a-button type="primary" @click="openNotification('topLeft')">
      <a-icon type="radius-upleft" />
      topLeft
    </a-button>
    <a-button type="primary" @click="openNotification('topRight')">
      <a-icon type="radius-upright" />
      topRight
    </a-button>
    <a-divider />
    <a-button type="primary" @click="openNotification('bottomLeft')">
      <a-icon type="radius-bottomleft" />
      bottomLeft
    </a-button>
    <a-button type="primary" @click="openNotification('bottomRight')">
      <a-icon type="radius-bottomright" />
      bottomRight
    </a-button>
  </code-box>
</template>
<script lang="ts">
  import {Notification} from '@/components';
  import CodeBox from '@/views/demo/code-box.vue';

  export default {
    name: 'notificationPosition',
    components: {CodeBox},
    methods: {
      openNotification(placement) {
        Notification.open({
          message: `Notification ${placement}`,
          description:
              'This is the content of the notification. This is the content of the notification. This is the content of the notification.',
          placement,
        });
      },
    },
  };
</script>
