<template>
  <demo-wrapper>
    <template v-slot:left>
      <cascader-basic/>
    </template>
    <template v-slot:right>
    
    </template>
  </demo-wrapper>
</template>
<script>
  import CascaderBasic from './basic';
  export default {
    components: { CascaderBasic }
  }
</script>
