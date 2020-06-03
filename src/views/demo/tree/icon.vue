<template>
  <code-box>
    <a-tree :tree-data="treeData" show-icon default-expand-all
            :default-selected-keys="['0-0-0']">
      <template v-slot:switcherIcon>
        <a-icon type="down"/>
      </template>
      <template v-slot:smile>
        <a-icon type="smile-o"/>
      </template>
      <template v-slot:meh>
        <a-icon type="smile-o"/>
      </template>
      <template v-slot:custom="{ selected }">
        <a-icon :type="selected ? 'frown' : 'frown-o'"/>
      </template>
    </a-tree>
  </code-box>
</template>
<script>
  import CodeBox from '../code-box';

  const treeData = [
    {
      title: 'parent 1',
      key: '0-0',
      slots: {
        icon: 'smile'
      },
      children: [
        { title: 'leaf', key: '0-0-0', slots: { icon: 'meh' } },
        { title: 'leaf', key: '0-0-1', slots: { icon: 'custom' } }
      ]
    }
  ];

  export default {
    name: 'treeIcon',
    components: { CodeBox },
    data() {
      return {
        treeData
      };
    },
    methods: {
      onSelect(selectedKeys, info) {
        console.log('selected', selectedKeys, info);
      },
      onCheck(checkedKeys, info) {
        console.log('onCheck', checkedKeys, info);
      }
    }
  };
</script>
