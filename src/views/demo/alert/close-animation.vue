<template>
  <code-box>
    <a-alert
        v-if="visible"
        message="Alert Message Text"
        type="success"
        closable
        :after-close="handleClose"
    />
  </code-box>
</template>
<script>
  import CodeBox from '../code-box';
  export default {
    name: 'alertCloseAnimation',
    components: { CodeBox },
    data() {
      return {
        visible: true,
      };
    },
    methods: {
      handleClose() {
        this.visible = false;
      },
    },
  };
</script>
