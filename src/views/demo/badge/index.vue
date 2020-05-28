<template>
  <demo-wrapper id="components-badge-demo">
    <template v-slot:left>
      <badge-basic-demo/>
      <badge-max-number-demo/>
      <badge-dot-demo/>
      <badge-tip-demo/>
    </template>
    <template v-slot:right>
      <badge-single-demo/>
      <badge-red-dot-demo/>
      <badge-animate-demo/>
      <badge-colorful-demo/>
    </template>
  </demo-wrapper>
</template>
<script>
  import BadgeBasicDemo from './basic';
  import BadgeMaxNumberDemo from './max';
  import BadgeDotDemo from './dot';
  import BadgeTipDemo from './title';
  import BadgeSingleDemo from './single';
  import BadgeRedDotDemo from './red-dot';
  import BadgeAnimateDemo from './animate';
  import BadgeColorfulDemo from './colorful';

  export default {
    components: { BadgeColorfulDemo, BadgeAnimateDemo, BadgeRedDotDemo, BadgeSingleDemo, BadgeTipDemo, BadgeDotDemo, BadgeMaxNumberDemo, BadgeBasicDemo }
  };
</script>
<style lang="less">
  #components-badge-demo {
    .ant-badge:not(.ant-badge-not-a-wrapper) {
      margin-right: 20px;
    }

    .head-example {
      width: 42px;
      height: 42px;
      border-radius: 4px;
      background: #eee;
      display: inline-block;
      vertical-align: middle;
    }
  }
</style>
