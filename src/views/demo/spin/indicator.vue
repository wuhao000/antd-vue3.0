<template>
  <code-box>
    <a-spin>
      <template v-slot:indicator>
        <a-icon type="loading"
                style="font-size: 24px" spin/>
      </template>
    </a-spin>
    <a-spin :indicator="indicator"/>
  </code-box>
</template>
<script lang="tsx" type="text/jsx">
  import CodeBox from '@/views/demo/code-box';
  import Icon from '@/components/icon';

  export default {
    name: 'SpinIndicatorDemo',
    components: { CodeBox },
    data() {
      return {
        indicator: <Icon type="loading" style="font-size: 24px" spin={true}/>
      };
    }
  };
</script>
