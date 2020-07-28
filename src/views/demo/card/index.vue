<template>
  <demo-wrapper>
    <template v-slot:left>
      <card-basic-demo/>
      <card-content-demo/>
      <card-grid-demo/>
      <card-loading-demo/>
      <card-simple-demo/>
    </template>
    <template v-slot:right>
      <card-no-border-demo/>
      <card-grid-content-demo/>
      <card-nested-demo/>
      <card-more-content-demo/>
      <card-tab-demo/>
    </template>
  </demo-wrapper>
</template>
<script>
  import CardBasicDemo from './basic';
  import CardContentDemo from './content';
  import CardGridDemo from './grid';
  import CardLoadingDemo from './loading';
  import CardSimpleDemo from './simple';
  import CardNoBorderDemo from './no-border';
  import CardGridContentDemo from './grid-content';
  import CardNestedDemo from './nested';
  import CardMoreContentDemo from './more-content';
  import CardTabDemo from './tab';
  export default {
    components: { CardTabDemo, CardMoreContentDemo, CardNestedDemo, CardGridContentDemo, CardNoBorderDemo, CardSimpleDemo, CardLoadingDemo, CardGridDemo, CardContentDemo, CardBasicDemo }
  }
</script>
