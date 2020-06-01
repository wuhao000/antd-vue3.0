<template>
  <demo-wrapper>
    <template v-slot:left>
      <notification-basic/>
      <notification-position/>
    </template>
    <template v-slot:right>
    </template>
  </demo-wrapper>
</template>
<script>
  import NotificationBasic from './basic';
  import NotificationPosition from './position';

  export default {
    components: { NotificationPosition, NotificationBasic }
  }
</script>
