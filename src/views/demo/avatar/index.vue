<template>
  <demo-wrapper>
    <template v-slot:left>
      <avatar-basic-demo/>
      <avatar-type-demo/>
    </template>
    <template v-slot:right>
    
    </template>
  </demo-wrapper>
</template>
<script>
  import AvatarBasicDemo from './basic';
  import AvatarTypeDemo from './type';
  export default {
    components: { AvatarTypeDemo, AvatarBasicDemo }
  };
</script>
