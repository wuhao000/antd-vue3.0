<template>
  <a-layout>
    <a-layout-header id="header" height="100px">
    </a-layout-header>
    <a-layout>
      <a-layout-sider>
      </a-layout-sider>
      <a-layout-content>
        <input-demo/>
      </a-layout-content>
    </a-layout>
    <a-layout-footer>
    </a-layout-footer>
  </a-layout>
</template>
<script lang="tsx">
  import {defineComponent, h} from 'vue';
  import AIcon from './components/icon';
  import InputDemo from './views/demo/menu/index.vue';

  export default defineComponent({
    components: {
      InputDemo,
      AIcon
    }
  });
</script>
<style scoped>
  img {
    width: 200px;
  }

  h1 {
    font-family: Arial, Helvetica, sans-serif;
  }
</style>
