<template>
  <code-box>
    <a-upload action="https://www.mocky.io/v2/5cc8019d300000980a055e76" directory>
      <a-button> <a-icon type="upload" /> Upload Directory </a-button>
    </a-upload>
  </code-box>
</template>
<script>
  import CodeBox from '../code-box';
  export default {
    name: 'uploadDirectory',
    components: { CodeBox }
  }
</script>
