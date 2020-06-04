<template>
  <div style="margin-bottom: 16px">
    showLine:
    <a-switch v-model:value="showLine"/>
    <br/>
    <br/>
    showIcon:
    <a-switch v-model:value="showIcon"/>
  </div>
  <a-tree
      :show-line="showLine"
      :show-icon="showIcon"
      :default-expanded-keys="['0-0-0', '0-0-1', '0-0-2']"
      @select="onSelect">
    <template v-slot:icon>
      <a-icon type="carry-out"/>
    </template>
    <a-tree-node key="0-0">
      <template v-slot:icon>
        <a-icon type="carry-out"/>
      </template>
      <template v-slot:title>
        <span style="color: #1890ff">parent 1</span>
      </template>
      <a-tree-node key="0-0-0" title="parent 1-0">
        <template v-slot:icon>
          <a-icon type="carry-out"/>
        </template>
        <a-tree-node key="0-0-0-0" title="leaf">
          <template v-slot:icon>
            <a-icon type="carry-out"/>
          </template>
        </a-tree-node>
        <a-tree-node key="0-0-0-1" title="leaf">
          <template v-slot:icon>
            <a-icon type="carry-out"/>
          </template>
        </a-tree-node>
        <a-tree-node key="0-0-0-2" title="leaf">
          <template v-slot:icon>
            <a-icon type="carry-out"/>
          </template>
        </a-tree-node>
      </a-tree-node>
      <a-tree-node key="0-0-1" title="parent 1-1">
        <template v-slot:icon>
          <a-icon type="carry-out"/>
        </template>
        <a-tree-node key="0-0-1-0" title="leaf">
          <template v-slot:icon>
            <a-icon type="carry-out"/>
          </template>
        </a-tree-node>
      </a-tree-node>
      <a-tree-node key="0-0-2" title="parent 1-2">
        <template v-slot:icon>
          <a-icon type="carry-out"/>
        </template>
        <a-tree-node key="0-0-2-0" title="leaf">
          <template v-slot:icon>
            <a-icon type="carry-out"/>
          </template>
        </a-tree-node>
        <a-tree-node key="0-0-2-1" title="leaf">
          <template v-slot:icon>
            <a-icon type="carry-out"/>
          </template>
          <template v-slot:switcherIcon>
            <a-icon type="form"/>
          </template>
        </a-tree-node>
      </a-tree-node>
    </a-tree-node>
  </a-tree>
</template>
<script>
  import CodeBox from '../code-box';

  export default {
    name: 'treeLine',
    components: { CodeBox },
    data() {
      return {
        showLine: true,
        showIcon: false
      };
    },
    methods: {
      onSelect(selectedKeys, info) {
        console.log('selected', selectedKeys, info);
      }
    }
  };
</script>
