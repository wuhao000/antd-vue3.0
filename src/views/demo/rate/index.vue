<template>
  <demo-wrapper>
    <template v-slot:left>
      <rate-basic-demo/>
      <rate-text-demo/>
      <rate-clear-demo/>
    </template>
    <template v-slot:right>
      <rate-half-demo/>
    </template>
  </demo-wrapper>
</template>
<script>
  import RateBasicDemo from './basic';
  import RateTextDemo from './text';
  import RateClearDemo from './clear';
  import RateHalfDemo from './half';

  export default {
    components: { RateHalfDemo, RateClearDemo, RateTextDemo, RateBasicDemo }
  };
</script>
