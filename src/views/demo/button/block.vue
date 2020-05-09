<template>
  <code-box :meta="meta">
    <a-button type="primary" block>Primary</a-button>
    <a-button block>Default</a-button>
    <a-button type="dashed" block>Dashed</a-button>
    <a-button type="danger" block>Danger</a-button>
    <a-button type="link" block>Link</a-button>
  </code-box>
</template>
<script lang="ts">
  import AButton from '@/components/button';
  import CodeBox from '@/views/demo/code-box.vue';

  export default {
    name: 'ButtonBlockDemo',
    components: {CodeBox, AButton},
    setup() {
      return {meta: `#### block 按钮
block属性将使按钮适合其父宽度。`}
    }
  };
</script>
