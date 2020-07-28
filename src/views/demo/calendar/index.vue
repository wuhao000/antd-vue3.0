<template>
  <demo-wrapper>
    <template v-slot:left>
      <a-calendar/>
    </template>
  </demo-wrapper>
</template>
<script lang="tsx">
  import Calendar from '@/components/calendar';
  export default {
    components: {
      ACalendar: Calendar
    },
    setup() {
      return {};
    }
  };
</script>
