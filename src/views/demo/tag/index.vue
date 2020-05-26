<template>
  <demo-wrapper>
    <template v-slot:left>
      <tag-basic-demo/>
      <tag-colorful-demo/>
    </template>
    <template v-slot:right>
      <tag-selectable-demo/>
      <tag-dynamic-demo/>
    </template>
  </demo-wrapper>
</template>
<script>
  import TagBasicDemo from './basic';
  import TagColorfulDemo from './colorful';
  import TagSelectableDemo from './selectable';
  import TagDynamicDemo from './dynamic';
  export default {
    components: { TagDynamicDemo, TagSelectableDemo, TagColorfulDemo, TagBasicDemo }
  };
</script>
