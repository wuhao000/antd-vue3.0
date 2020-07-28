<template>
  <demo-wrapper>
    <template v-slot:left>
      <empty-basic-demo/>
    </template>
  </demo-wrapper>
</template>
<script>
  import EmptyBasicDemo from './basic';

  export default {
    components: { EmptyBasicDemo }
  };
</script>
