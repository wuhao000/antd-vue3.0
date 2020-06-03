<template>
  <demo-wrapper>
    <template v-slot:left>
<!--      <tree-controlled/>-->
<!--      <tree-custom-treenode/>-->
<!--      <tree-drag/>-->
<!--      <tree-line/>-->
<!--      <tree-contents/>-->
    </template>
    <template v-slot:right>
<!--      <tree-basic/>-->
<!--      <tree-icon/>-->
<!--      <tree-remote-data/>-->
<!--      <tree-search/>-->
      <tree-expand-icon/>
    </template>
  </demo-wrapper>
</template>
<script>
  import TreeBasic from './basic';
  import TreeIcon from './icon';
  import TreeControlled from './controlled';
  import TreeCustomTreenode from './custom-treenode';
  import TreeDrag from './drag';
  import TreeLine from './line';
  import TreeContents from './contents';
  import TreeRemoteData from './remote-data';
  import TreeSearch from './search';
  import TreeExpandIcon from './expand-icon';

  export default {
    components: { TreeExpandIcon, TreeSearch, TreeRemoteData, TreeContents, TreeLine, TreeDrag, TreeCustomTreenode, TreeControlled, TreeIcon, TreeBasic }
  };
</script>
