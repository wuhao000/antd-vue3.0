<template>
  <slot/>
  <vnode-tree-node v-for="child in children" :node="child"/>
</template>
<script lang="ts">
  import VnodeTreeNode from './vnode-tree-node';
  export default {
    name: 'vnodeTree',
    components: { VnodeTreeNode },
    setup(_, { slots }) {
      return {
        children: slots.default && slots.default()
      };
    }
  };
</script>
