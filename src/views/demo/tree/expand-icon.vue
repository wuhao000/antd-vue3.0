<template>
  <code-box>
    <a-tree show-line :default-expanded-keys="['0-0-0']" @select="onSelect">
      <template v-slot:switcherIcon>
        <a-icon type="down" />
      </template>
      <a-tree-node key="0-0" title="parent 1">
        <a-tree-node key="0-0-0" title="parent 1-0">
          <a-tree-node key="0-0-0-0" title="leaf" />
          <a-tree-node key="0-0-0-1" title="leaf" />
          <a-tree-node key="0-0-0-2" title="leaf" />
        </a-tree-node>
        <a-tree-node key="0-0-1" title="parent 1-1">
          <a-tree-node key="0-0-1-0" title="leaf" />
        </a-tree-node>
        <a-tree-node key="0-0-2" title="parent 1-2">
          <a-tree-node key="0-0-2-0" title="leaf" />
          <a-tree-node key="0-0-2-1" title="leaf" />
        </a-tree-node>
      </a-tree-node>
    </a-tree>
  </code-box>
</template>
<script>
  import CodeBox from '../code-box';
  export default {
    name: 'treeExpandIcon',
    components: { CodeBox },
    methods: {
      onSelect(selectedKeys, info) {
        console.log('selected', selectedKeys, info);
      },
    },
  };
</script>
