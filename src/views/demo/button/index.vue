<template>
  <div id="components-button-demo-disabled">
    <demo-wrapper>
      <template v-slot:left>
        <basic-demo/>
        <disabled-demo/>
        <icon-demo/>
        <button-block-demo/>
      </template>
      <template v-slot:right>
        <button-group-demo/>
        <button-loading-demo/>
        <button-size-demo/>
      </template>
    </demo-wrapper>
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
