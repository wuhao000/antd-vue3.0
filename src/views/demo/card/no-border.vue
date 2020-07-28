<template>
  <code-box style="background:#ECECEC; padding:30px">
    <a-card title="Card title"
            :bordered="false"
            style="width: 300px">
      <p>Card content</p>
      <p>Card content</p>
      <p>Card content</p>
    </a-card>
  </code-box>
</template>
<script>
  import CodeBox from '../code-box';
  export default {
    name: 'CardNoBorderDemo',
    components: { CodeBox }
  }
</script>
