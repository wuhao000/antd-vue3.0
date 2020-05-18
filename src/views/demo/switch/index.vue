<template>
  <demo-wrapper>
    <template v-slot:left>
      <basic-switch-demo/>
      <icon-switch-demo/>
      <switch-loading-demo/>
    </template>
    <template v-slot:right>
      <switch-disabled-demo/>
      <switch-size-demo/>
    </template>
  </demo-wrapper>
</template>
<script>
  import BasicSwitchDemo from './basic';
  import IconSwitchDemo from './icon';
  import SwitchLoadingDemo from './loading';
  import SwitchDisabledDemo from './disabled';
  import SwitchSizeDemo from './size';
  export default {
    components: { SwitchSizeDemo, SwitchDisabledDemo, SwitchLoadingDemo, IconSwitchDemo, BasicSwitchDemo }
  }
</script>
