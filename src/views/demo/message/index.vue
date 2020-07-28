<template>
  <demo-wrapper>
    <template v-slot:left>
      <message-basic/>
      <message-loading/>
      <message-promise/>
    </template>
    <template v-slot:right>
      <message-duration/>
      <message-type/>
      <message-update-content/>
    </template>
  </demo-wrapper>
</template>
<script>
  import MessageBasic from './basic';
  import MessageLoading from './loading';
  import MessagePromise from './promise';
  import MessageDuration from './duration';
  import MessageType from './type';
  import MessageUpdateContent from './update-content';
  export default {
    components: { MessageUpdateContent, MessageType, MessageDuration, MessagePromise, MessageLoading, MessageBasic }
  }
</script>
