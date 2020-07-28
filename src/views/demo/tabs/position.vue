<template>
  <code-box style="width: 500px">
    <a-radio-group v-model:value="tabPosition" style="margin:8px">
      <a-radio-button value="top">
        top
      </a-radio-button>
      <a-radio-button value="bottom">
        bottom
      </a-radio-button>
      <a-radio-button value="left">
        left
      </a-radio-button>
      <a-radio-button value="right">
        right
      </a-radio-button>
    </a-radio-group>
    <a-tabs default-active-key="1" :tab-position="tabPosition">
      <a-tab-pane key="1" tab="Tab 1">
        Content of Tab 1
      </a-tab-pane>
      <a-tab-pane key="2" tab="Tab 2">
        Content of Tab 2
      </a-tab-pane>
      <a-tab-pane key="3" tab="Tab 3">
        Content of Tab 3
      </a-tab-pane>
    </a-tabs>
  </code-box>
</template>
<script>
  import CodeBox from '../code-box';
  export default {
    name: 'TabsPositionDemo',
    components: { CodeBox },
    data() {
      return {
        tabPosition: 'top',
      };
    },
    methods: {
      callback(val) {
        console.log(val);
      },
    },
  };
</script>
