<template>
  <demo-wrapper>
    <template v-slot:left>
      <affix-basic-demo/>
      <affix-scroll-container/>
    </template>
    <template v-slot:right>
      <affix-callback/>
    </template>
  </demo-wrapper>
</template>
<script>
  import AffixBasicDemo from './basic';
  import AffixScrollContainer from './scroll-container';
  import AffixCallback from './callback';

  export default {
    components: { AffixCallback, AffixScrollContainer, AffixBasicDemo }
  }
</script>
