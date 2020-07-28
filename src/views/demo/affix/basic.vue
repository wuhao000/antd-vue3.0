<template>
  <div>
    <a-affix :offset-top="top" :target="container">
      <a-button type="primary" @click="top += 10">
        Affix top
      </a-button>
    </a-affix>
    <br />
    <a-affix :offset-bottom="bottom">
      <a-button type="primary" @click="bottom += 10">
        Affix bottom
      </a-button>
    </a-affix>
  </div>
</template>

<script lang="ts">
  import {ref} from 'vue';
  export default {
    setup() {
      const top = ref(10);
      const bottom = ref(10);
      return {
        top,
        bottom,
        container: () => document.getElementById('main-container'),
        meta: `####基本
最简单的用法。`
      };
    },
  };
</script>
