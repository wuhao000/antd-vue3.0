<template>
  <code-box>
    <a-switch default-checked @change="onChange" />
  </code-box>
</template>
<script lang="tsx">
  export default {
    name: 'BasicSwitchDemo',
    setup() {
      return {
        onChange: (checked) => {
          console.log(`a-switch to ${checked}`);
        }
      }
    }
  }
</script>
