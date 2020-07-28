<template>
  <demo-wrapper>
    <template v-slot:left>
      <tabs-basic-demo/>
      <tabs-disabled-demo/>
      <tabs-icon-demo/>
      <tabs-direction-demo/>
      <tabs-extra-demo/>
      <tabs-position-demo/>
      <tabs-card-demo/>
      <tabs-close-demo/>
    </template>
    <template v-slot:right></template>
  </demo-wrapper>
</template>
<script>
  import TabsBasicDemo from './basic';
  import TabsDisabledDemo from './disabled';
  import TabsIconDemo from './icon';
  import TabsDirectionDemo from './direction';
  import TabsExtraDemo from './extra';
  import TabsPositionDemo from './position';
  import TabsCardDemo from './card';
  import TabsCloseDemo from './close-add';
  export default {
    components: { TabsCloseDemo, TabsCardDemo, TabsPositionDemo, TabsExtraDemo, TabsDirectionDemo, TabsIconDemo, TabsDisabledDemo, TabsBasicDemo }
  };
</script>
