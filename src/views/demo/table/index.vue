<template>
  <demo-wrapper>
    <template v-slot:left>
      <table-basic-demo/>
    </template>
    <template v-slot:right>
    
    </template>
  </demo-wrapper>
</template>
<script>
  import TableBasicDemo from './basic';
  export default {
    components: { TableBasicDemo }
  };
</script>
