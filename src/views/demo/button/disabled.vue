<template>
  <code-box>
    <AButton type="primary">Primary</AButton>
    <AButton type="primary" disabled={true}>Primary(disabled)</AButton>
    <br/>
    <AButton>Default</AButton>
    <AButton disabled={true}>Default(disabled)</AButton>
    <br/>
    <AButton type="dashed">Dashed</AButton>
    <AButton type="dashed" disabled={true}>Dashed(disabled)</AButton>
    <br/>
    <AButton type="link">Link</AButton>
    <AButton type="link" disabled={true}>Link(disabled)</AButton>
    <div :style="{padding: '8px 8px 0 8px', background: 'rgb(190, 200, 200)'}">
      <AButton ghost={true}>Ghost</AButton>
      <AButton ghost={true} disabled={true}>Ghost(disabled)</AButton>
    </div>
  </code-box>
</template>
<script lang="ts">
  import AButton from '@/components/button';
  import CodeBox from '@/views/demo/code-box.vue';

  export default {
    components: {CodeBox, AButton}
  };
</script>
