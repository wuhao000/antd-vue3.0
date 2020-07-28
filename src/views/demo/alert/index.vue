<template>
  <demo-wrapper>
    <template v-slot:left>
      <alert-basic-demo/>
      <alert-closable/>
      <alert-description/>
      <alert-type/>
    </template>
    <template v-slot:right>
      <alert-top/>
      <alert-custom-close/>
      <alert-icon/>
      <alert-close-animation/>
    </template>
  </demo-wrapper>
</template>
<script>
  import AlertBasicDemo from './basic';
  import AlertClosable from './closable';
  import AlertDescription from './description';
  import AlertType from './type';
  import AlertTop from './top';
  import AlertCustomClose from './custom-close';
  import AlertIcon from './icon';
  import AlertCloseAnimation from './close-animation';
  export default {
    components: { AlertCloseAnimation, AlertIcon, AlertCustomClose, AlertTop, AlertType, AlertDescription, AlertClosable, AlertBasicDemo }
  }
</script>
