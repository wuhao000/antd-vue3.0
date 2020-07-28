<template>
  <demo-wrapper>
    <template v-slot:left>
      <select-basic-demo/>
      <select-tags-demo/>
    </template>
  </demo-wrapper>
</template>
<script lang="tsx" type="text/javascript">
  import SelectBasicDemo from './basic';
  import SelectTagsDemo from './tags';
  export default {
    components: { SelectTagsDemo, SelectBasicDemo },
    setup() {

    }
  };
</script>
