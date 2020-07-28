<template>
  <code-box>
    <a-input-number id="inputNumber"
                    v-model:value="value"
                    :min="1"
                    :max="10"
                    @change="onChange"/>
    当前值：{{ value }}
  </code-box>
</template>
<script>
  import CodeBox from '../code-box';

  export default {
    name: 'InputNumberBasicDemo',
    components: { CodeBox },
    data() {
      return {
        value: 3,
      };
    },
    methods: {
      onChange(value) {
        console.log('changed', value);
      },
    },
  };
</script>
