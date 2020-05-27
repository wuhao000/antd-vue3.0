<template>
  <demo-wrapper>
    <template v-slot:left>
      <tabs-basic-demo/>
      <tabs-disabled-demo/>
      <tabs-icon-demo/>
      <tabs-direction-demo/>
    </template>
    <template v-slot:right></template>
  </demo-wrapper>
</template>
<script>
  import TabsBasicDemo from './basic';
  import TabsDisabledDemo from './disabled';
  import TabsIconDemo from './icon';
  import TabsDirectionDemo from './direction';
  export default {
    components: { TabsDirectionDemo, TabsIconDemo, TabsDisabledDemo, TabsBasicDemo }
  };
</script>
