<template>
  <demo-wrapper>
    <template v-slot:left>
      <cascader-basic/>
      <cascader-custom-selected/>
      <cascader-default-value/>
      <cascader-hover-expand/>
      <cascader-search/>
    </template>
    <template v-slot:right>
    
    </template>
  </demo-wrapper>
</template>
<script>
  import CascaderBasic from './basic';
  import CascaderDefaultValue from './default-value';
  import CascaderHoverExpand from './hover-expand';
  import CascaderSearch from './search';
  import CascaderCustomSelected from './custom-selected';
  export default {
    components: { CascaderCustomSelected, CascaderSearch, CascaderHoverExpand, CascaderDefaultValue, CascaderBasic }
  }
</script>
