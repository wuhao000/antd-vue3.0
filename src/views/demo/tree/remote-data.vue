<template>
  <code-box>
    <a-tree :load-data="onLoadData" :tree-data="treeData" />
  </code-box>
</template>

<script>
  import CodeBox from '../code-box';
  export default {
    name: 'treeRemoteData',
    components: { CodeBox },
    data() {
      return {
        treeData: [
          { title: 'Expand to load', key: '0' },
          { title: 'Expand to load', key: '1' },
          { title: 'Tree Node', key: '2', isLeaf: true },
        ],
      };
    },
    methods: {
      onLoadData(treeNode) {
        return new Promise(resolve => {
          if (treeNode.dataRef.children) {
            resolve();
            return;
          }
          setTimeout(() => {
            treeNode.dataRef.children = [
              { title: 'Child Node', key: `${treeNode.eventKey}-0` },
              { title: 'Child Node', key: `${treeNode.eventKey}-1` },
            ];
            this.treeData = [...this.treeData];
            resolve();
          }, 1000);
        });
      },
    },
  };
</script>
