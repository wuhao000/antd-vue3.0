<template>
  <demo-wrapper>
    <template v-slot:left>
      <spin-basic-demo/>
      <spin-container-demo/>
      <spin-text-demo/>
      <spin-indicator-demo/>
    </template>
    <template v-slot:right>
      <spin-size-demo/>
      <spin-card-demo/>
      <spin-delay-demo/>
    </template>
  </demo-wrapper>
</template>
<script>
  import SpinBasicDemo from './basic';
  import SpinContainerDemo from './container';
  import SpinTextDemo from './text';
  import SpinIndicatorDemo from './indicator';
  import SpinSizeDemo from './size';
  import SpinCardDemo from './card';
  import SpinDelayDemo from './delay';

  export default {
    components: {
      SpinDelayDemo,
      SpinCardDemo,
      SpinSizeDemo,
      SpinIndicatorDemo,
      SpinTextDemo,
      SpinContainerDemo,
      SpinBasicDemo
    }
  };
</script>
