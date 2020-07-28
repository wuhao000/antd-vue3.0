<template>
  <code-box>
    <a-progress stroke-linecap="square" :percent="75" />
    <a-progress stroke-linecap="square" :percent="75" type="circle" />
    <a-progress stroke-linecap="square" :percent="75" type="dashboard" />
  </code-box>
</template>
<script>
  export default {
    name: 'progressCorner'
  }
</script>
