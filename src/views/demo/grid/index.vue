<template>
  <demo-wrapper class="grid-demo">
    <basic-demo/>
    <flex-demo/>
  </demo-wrapper>
</template>
<script lang="ts">
  import BasicDemo from './basic.vue';
  import FlexDemo from './flex.vue';

  export default {
    components: {BasicDemo, FlexDemo}
  };
</script>
<style>
  .grid-demo .code-box-demo .ant-row-flex > div:not(.gutter-row):nth-child(odd), .grid-demo .code-box-demo .ant-row > div:not(.gutter-row):nth-child(odd), [id^=components-grid-demo-] .code-box-demo .ant-row-flex > div:not(.gutter-row):nth-child(odd), [id^=components-grid-demo-] .code-box-demo .ant-row > div:not(.gutter-row):nth-child(odd) {
    background: rgba(0, 160, 233, .7);
  }

  .grid-demo .code-box-demo .ant-row-flex > div:not(.gutter-row), .grid-demo .code-box-demo .ant-row > div:not(.gutter-row), [id^=components-grid-demo-] .code-box-demo .ant-row-flex > div:not(.gutter-row), [id^=components-grid-demo-] .code-box-demo .ant-row > div:not(.gutter-row) {
    background: #00a0e9;
    padding: 16px 0;
  }

  .grid-demo .ant-row-flex > div, .grid-demo .ant-row > div, .grid-demo .code-box-demo .ant-row-flex > div, .grid-demo .code-box-demo .ant-row > div, [id^=components-grid-demo-] .ant-row-flex > div, [id^=components-grid-demo-] .ant-row > div, [id^=components-grid-demo-] .code-box-demo .ant-row-flex > div, [id^=components-grid-demo-] .code-box-demo .ant-row > div {
    padding: 5px 0;
    text-align: center;
    border-radius: 0;
    min-height: 30px;
    margin-top: 8px;
    margin-bottom: 8px;
    color: #fff;
  }

  .grid-demo .code-box-demo .ant-row-flex>div:not(.gutter-row):nth-child(odd), .grid-demo .code-box-demo .ant-row>div:not(.gutter-row):nth-child(odd), [id^=components-grid-demo-] .code-box-demo .ant-row-flex>div:not(.gutter-row):nth-child(odd), [id^=components-grid-demo-] .code-box-demo .ant-row>div:not(.gutter-row):nth-child(odd) {
    background: rgba(0,160,233,.7);
  }
  .grid-demo .code-box-demo .ant-row-flex>div:not(.gutter-row), .grid-demo .code-box-demo .ant-row>div:not(.gutter-row), [id^=components-grid-demo-] .code-box-demo .ant-row-flex>div:not(.gutter-row), [id^=components-grid-demo-] .code-box-demo .ant-row>div:not(.gutter-row) {
    background: #00a0e9;
    padding: 16px 0;
  }
  .grid-demo .ant-row-flex>div, .grid-demo .ant-row>div, .grid-demo .code-box-demo .ant-row-flex>div, .grid-demo .code-box-demo .ant-row>div, [id^=components-grid-demo-] .ant-row-flex>div, [id^=components-grid-demo-] .ant-row>div, [id^=components-grid-demo-] .code-box-demo .ant-row-flex>div, [id^=components-grid-demo-] .code-box-demo .ant-row>div {
    padding: 5px 0;
    text-align: center;
    border-radius: 0;
    min-height: 30px;
    margin-top: 8px;
    margin-bottom: 8px;
    color: #fff;
  }
</style>
