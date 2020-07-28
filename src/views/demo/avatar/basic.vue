<template>
  <code-box>
    <div>
      <a-avatar :size="64" icon="user" />
      <a-avatar size="large" icon="user" />
      <a-avatar icon="user" />
      <a-avatar size="small" icon="user" />
    </div>
    <br />
    <div>
      <a-avatar shape="square" :size="64" icon="user" />
      <a-avatar shape="square" size="large" icon="user" />
      <a-avatar shape="square" icon="user" />
      <a-avatar shape="square" size="small" icon="user" />
    </div>
  </code-box>
</template>
<script lang="ts">
  import CodeBox from '@/views/demo/code-box.vue';
  export default {
    name: 'AvatarBasicDemo',
    components: {CodeBox}
  }
</script>
