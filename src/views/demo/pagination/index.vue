<template>
  <demo-wrapper>
    <template v-slot:left>
      <pagination-basic-demo/>
      <pagination-more-demo/>
      <pagination-change-demo/>
    </template>
    <template v-slot:right>
    
    </template>
  </demo-wrapper>
</template>
<script>
  import PaginationBasicDemo from './basic';
  import PaginationMoreDemo from './more';
  import PaginationChangeDemo from './change';
  export default {
    components: { PaginationChangeDemo, PaginationMoreDemo, PaginationBasicDemo }
  };
</script>
