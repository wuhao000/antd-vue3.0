<template>
  <code-box id="components-button-demo-button-group" :meta="meta">
    <h4>Basic</h4>
    <a-button-group>
      <a-button>Cancel</a-button>
      <a-button type="primary">OK</a-button>
    </a-button-group>
    <a-button-group>
      <a-button disabled>L</a-button>
      <a-button disabled>M</a-button>
      <a-button disabled>R</a-button>
    </a-button-group>
    <a-button-group>
      <a-button type="primary">L</a-button>
      <a-button>M</a-button>
      <a-button>M</a-button>
      <a-button type="dashed">R</a-button>
    </a-button-group>
    <h4>With Icon</h4>
    <a-button-group>
      <a-button type="primary">
        <a-icon type="left"/>
        Go back
      </a-button>
      <a-button type="primary"> Go forward
        <a-icon type="right"/>
      </a-button>
    </a-button-group>
    <a-button-group>
      <a-button type="primary" icon="cloud"/>
      <a-button type="primary" icon="cloud-download"/>
    </a-button-group>
  </code-box>
</template>
<script lang="tsx">
  import AButton from '@/components/button';
  import CodeBox from '@/views/demo/code-box.vue';

  export default {
    name: 'ButtonGroupDemo',
    components: {CodeBox, AButton, AButtonGroup: AButton.Group},
    setup() {
      return {
        meta: `按钮组合
可以将多个 Button 放入 Button.Group 的容器中。
通过设置 size 为 large small 分别把按钮组合设为大、小尺寸。若不设置 size，则尺寸为中。`
      };
    }
  };
</script>
<style>
  #components-button-demo-button-group > h4 {
    margin: 16px 0;
    font-size: 14px;
    line-height: 1;
    font-weight: normal;
  }

  #components-button-demo-button-group > h4:first-child {
    margin-top: 0;
  }

  #components-button-demo-button-group .ant-btn-group {
    margin-right: 8px;
  }

  [id^=components-button-demo-] .ant-btn-group>.ant-btn {
    margin-right: 0;
  }
</style>
