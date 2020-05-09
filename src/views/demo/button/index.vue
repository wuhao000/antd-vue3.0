<template>
  <div id="components-button-demo-disabled">
    <a-row :gutter="20">
      <a-col :span="12">
        <basic-demo/>
        <disabled-demo/>
        <icon-demo/>
        <button-block-demo/>
      </a-col>
      <a-col :span="12">
        <button-group-demo/>
        <button-loading-demo/>
        <button-size-demo/>
      </a-col>
    </a-row>
  </div>
</template>
<script lang="tsx">
  import {Col, Row} from '@/components/grid';
  import ButtonBlockDemo from '@/views/demo/button/block.vue';
  import ButtonGroupDemo from '@/views/demo/button/group.vue';
  import ButtonLoadingDemo from '@/views/demo/button/loading.vue';
  import ButtonSizeDemo from '@/views/demo/button/size.vue';
  import CodeBox from '@/views/demo/code-box.vue';
  import {defineComponent} from 'vue';
  import BasicDemo from './basic.vue';
  import DisabledDemo from './disabled.vue';
  import IconDemo from './icon.vue';
  import './index.less';

  export default defineComponent({
    components: {
      ButtonSizeDemo,
      ButtonLoadingDemo,
      ButtonGroupDemo,
      ButtonBlockDemo,
      CodeBox,
      ACol: Col,
      ARow: Row,
      BasicDemo,
      IconDemo,
      DisabledDemo
    }
  });
</script>
