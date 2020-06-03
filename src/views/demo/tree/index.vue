<template>
  <demo-wrapper>
    <template v-slot:left>
      <tree-basic/>
    </template>
    <template v-slot:right>
    
    </template>
  </demo-wrapper>
</template>
<script>
  import TreeBasic from './basic';
  export default {
    components: { TreeBasic }
  }
</script>
