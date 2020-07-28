<template>
  <code-box>
    <a-rate v-model:value="value" :tooltips="desc" />
    <span class="ant-rate-text">{{ desc[value - 1] }}</span>
  </code-box>
</template>
<script>
  import CodeBox from '../code-box';
  export default {
    name: 'RateTextDemo',
    components: { CodeBox },
    data() {
      return {
        value: 3,
        desc: ['terrible', 'bad', 'normal', 'good', 'wonderful'],
      };
    },
  };
</script>
