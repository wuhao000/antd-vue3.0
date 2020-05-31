<template>
  <demo-wrapper>
    <!--    <menu-top-demo/>-->
    <!--    <menu-left-demo/>-->
    <menu-collapse-demo/>
    <!--    <menu-unique-open-demo/>-->
    <!--    <menu-vertical-demo/>-->
    <!--    <menu-theme-demo/>-->
    <!--    <menu-change-mode-demo/>-->
    <!--    <menu-recursive-dmeo/>-->
  </demo-wrapper>
</template>
<script lang="ts">
  import MenuChangeModeDemo from '@/views/demo/menu/change-mode.vue';
  import MenuCollapseDemo from '@/views/demo/menu/collapse.vue';
  import MenuLeftDemo from '@/views/demo/menu/left.vue';
  import MenuRecursiveDmeo from '@/views/demo/menu/recursive.vue';
  import MenuThemeDemo from '@/views/demo/menu/theme.vue';
  import MenuTopDemo from '@/views/demo/menu/top.vue';
  import MenuUniqueOpenDemo from '@/views/demo/menu/unique-open.vue';
  import MenuVerticalDemo from '@/views/demo/menu/vertical.vue';

  export default {
    components: {
      MenuRecursiveDmeo,
      MenuChangeModeDemo,
      MenuThemeDemo, MenuVerticalDemo, MenuUniqueOpenDemo, MenuCollapseDemo, MenuLeftDemo, MenuTopDemo
    }
  };
</script>
