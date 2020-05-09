<template>
  <code-box>
    <a-input-search placeholder="input search loading deault" loading/>
    <a-input-search placeholder="input search loading with enterButton"
                    loading :enter-button="true"/>
  </code-box>
</template>
<script>
  import CodeBox from '@/views/demo/code-box.vue';

  export default {
    name: 'InputSearchDemo',
    components: { CodeBox }
  };
</script>
