<template>
  <code-box>
    <a-alert message="Warning Text Warning Text Warning TextW arning Text Warning Text Warning TextWarning Text"
             type="warning" closable
             @close="onClose"
    />
    <a-alert message="Error Text"
             description="Error Description Error Description Error Description Error Description Error Description Error Description"
             type="error" closable
             @close="onClose"
    />
  </code-box>
</template>
<script>
  import CodeBox from '../code-box';
  export default {
    name: 'alertClosable',
    components: { CodeBox },
    methods: {
      onClose(e) {
        console.log(e, 'I was closed.');
      },
    },
  };
</script>
