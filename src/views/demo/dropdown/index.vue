<template>
  <demo-wrapper>
    <template v-slot:left>
<!--      <dropdown-basic-demo/>-->
<!--      <dropdown-button-demo/>-->
<!--      <dropdown-other-element-demo/>-->
<!--      <dropdown-position-demo/>-->
<!--      <dropdown-trigger-demo/>-->
    </template>
    <template v-slot:right>
<!--      <dropdown-contextmenu-demo/>-->
<!--      <dropdown-click-item-demo/>-->
<!--      <dropdown-hide-action-demo/>-->
      <dropdown-cascading-demo/>
    </template>
  </demo-wrapper>
</template>
<script>
  import DropdownBasicDemo from './basic';
  import DropdownButtonDemo from './button';
  import DropdownOtherElementDemo from './other-element';
  import DropdownPositionDemo from './position';
  import DropdownTriggerDemo from './trigger';
  import DropdownContextmenuDemo from './contextmenu';
  import DropdownClickItemDemo from './click-item';
  import DropdownHideActionDemo from './hide-action';
  import DropdownCascadingDemo from './cascading';

  export default {
    components: { DropdownCascadingDemo, DropdownHideActionDemo, DropdownClickItemDemo, DropdownContextmenuDemo, DropdownTriggerDemo, DropdownPositionDemo, DropdownOtherElementDemo, DropdownButtonDemo, DropdownBasicDemo }
  }
</script>
