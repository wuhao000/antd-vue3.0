<template>
  <code-box style="width: 500px">
    <a-radio-group v-model:value="mode"
                   :style="{ marginBottom : '8px' }">
      <a-radio-button value="top">
        Horizontal
      </a-radio-button>
      <a-radio-button value="left">
        Vertical
      </a-radio-button>
    </a-radio-group>
    <a-tabs default-active-key="1"
            :tab-position="mode"
            :style="{ height : '200px' }"
            @prevClick="callback"
            @nextClick="callback">
      <a-tab-pane v-for="i in 30"
                  :key="i"
                  :tab="`Tab-${i}`"> Content of tab {{ i }}</a-tab-pane>
    </a-tabs>
  </code-box>
</template>
<script>
  import CodeBox from '../code-box';
  export default {
    name: 'TabsDirectionDemo',
    components: { CodeBox },
    data() {
      return {
        mode: 'top'
      };
    },
    methods: {
      callback(val) {
        // console.log(val);
      }
    }
  };
</script>
