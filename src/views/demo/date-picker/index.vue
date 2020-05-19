<template>
  <demo-wrapper>
    <template v-slot:left>
      <date-picker-basic-demo/>
    </template>
  </demo-wrapper>
</template>
<script>
  import DatePickerBasicDemo from './basic';
  export default {
    components: { DatePickerBasicDemo }
  };
</script>
