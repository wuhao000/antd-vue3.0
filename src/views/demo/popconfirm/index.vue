<template>
  <demo-wrapper>
    <template v-slot:left>
      <popconfirm-basic-demo/>
      <popconfirm-position-demo/>
      <popconfirm-icon-demo/>
    </template>
    <template v-slot:right>
    
    </template>
  </demo-wrapper>
</template>
<script>
  import PopconfirmBasicDemo from './basic';
  import PopconfirmPositionDemo from './position';
  import PopconfirmIconDemo from './icon';
  export default {
    components: { PopconfirmIconDemo, PopconfirmPositionDemo, PopconfirmBasicDemo }
  }
</script>
