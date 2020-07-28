<template>
  <demo-wrapper>
    <template v-slot:left>
      <input-number-basic-demo/>
    </template>
  </demo-wrapper>
</template>
<script>
  import InputNumberBasicDemo from './basic';
  export default {
    components: { InputNumberBasicDemo }
  }
</script>
