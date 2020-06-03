<template>
  <pre>
    {{startTag}}
      <vnode-tree-node v-for="child in children"
                       :node="child"></vnode-tree-node>
    {{endTag}}
  </pre>
</template>
<script lang="ts">
  import {ref} from 'vue';

  export default {
    name: 'vnodeTreeNode',
    props: {
      node: Object
    },
    setup(props) {
      const node = props.node;
      const name = ref(null);
      if (typeof node.type === 'object') {
        name.value = node.type.name;
      }
      const startTag = `<${name.value}>`;
      const endTag = `</${name.value}>`;
      const getChildren = () => {
        if (typeof node.children === 'object') {
          if (Array.isArray(node.children)) {
            return node.children;
          } else {
            if (!node.children) {
              return [];
            }
            const children = [];
            Object.keys(node.children).forEach(key => {
              const slot = node.children[key];
              if (Array.isArray(slot)) {
                children.push(slot);
              } else if (typeof slot === 'function') {
                children.push(...node.children[key]());
              }
            });
            return children;
          }
        }
        return [];
      };

      return {
        name,
        startTag,
        endTag,
        children: getChildren()
      };
    }
  };
</script>
