<template>
  <a-affix :offset-top="120"
           @change="change">
    <a-button>120px to affix top</a-button>
  </a-affix>
</template>
<script>
  export default {
    name: 'affixCallback',
    methods: {
      change(affixed) {
        console.log(affixed);
      },
    },
    data() {
      return {
        meta: `#### 固定状态改变的回调
可以获得是否固定的状态。`
      }
    }
  };
</script>
