<template>
  <demo-wrapper>
    <template v-slot:left>
      <dropdown-basic-demo/>
    </template>
    <template v-slot:right>
    
    </template>
  </demo-wrapper>
</template>
<script>
  import DropdownBasicDemo from './basic';
  export default {
    components: { DropdownBasicDemo }
  }
</script>
