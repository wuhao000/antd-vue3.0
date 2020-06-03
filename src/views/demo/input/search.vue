<template>
  <a-input-search placeholder="input search loading deault" loading/>
  <br/>
  <br/>
  <a-input-search placeholder="input search loading with enterButton" loading
                  :enter-button="true"/>
</template>
<script lang="ts">
  import CodeBox from '@/views/demo/code-box.vue';

  export default {
    name: 'InputSearchDemo',
    components: {CodeBox},
    setup() {
      return {
        meta: `####搜索框 loading
用于 onSearch 的时候展示 loading。`
      };
    }
  };
</script>
