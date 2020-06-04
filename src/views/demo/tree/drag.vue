<template>
  <a-tree class="draggable-tree"
          :default-expanded-keys="expandedKeys" draggable
          :tree-data="gData"
          @dragenter="onDragEnter"
          @drop="onDrop"
  />
</template>
<script lang="tsx">
  import {ComponentInternalInstance} from '@vue/runtime-core';
  import CodeBox from '../code-box.vue';

  const x = 3;
  const y = 2;
  const z = 1;
  const gData = [];

  const generateData = (_level, _preKey?, _tns?) => {
    const preKey = _preKey || '0';
    const tns = _tns || gData;

    const children = [];
    for (let i = 0; i < x; i++) {
      const key = `${preKey}-${i}`;
      tns.push({title: key, key});
      if (i < y) {
        children.push(key);
      }
    }
    if (_level < 0) {
      return tns;
    }
    const level = _level - 1;
    children.forEach((key, index) => {
      tns[index].children = [];
      return generateData(level, key, tns[index].children);
    });
  };
  generateData(z);
  export default {
    name: 'treeDrag',
    components: {CodeBox},
    data() {
      return {
        gData,
        expandedKeys: ['0-0', '0-0-0', '0-0-0-0']
      };
    },
    methods: {
      onDragEnter(info) {
        // expandedKeys 需要受控时设置
        // this.expandedKeys = info.expandedKeys
      },
      onDrop(info: {
        dragNode: any;
        dropPosition: any;
        node: ComponentInternalInstance;
        dropToGap: boolean;
      }) {
        const dropKey = info.node['ctx'].eventKey;
        const dragKey = info.dragNode.ctx.eventKey;
        const dropPos = info.node['ctx'].pos.split('-');
        const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);
        const loop = (data, key, callback) => {
          data.forEach((item, index, arr) => {
            if (!item) {
              return;
            }
            if (item.key === key) {
              return callback(item, index, arr);
            }
            if (item.children) {
              return loop(item.children, key, callback);
            }
          });
        };
        const data = [...this.gData];
        // Find dragObject
        let dragObj;
        loop(data, dragKey, (item, index, arr) => {
          arr.splice(index, 1);
          dragObj = item;
        });
        if (!info.dropToGap) {
          // Drop on the content
          loop(data, dropKey, item => {
            item.children = item.children || [];
            // where to insert 示例添加到尾部，可以是随意位置
            item.children.push(dragObj);
          });
        } else if (
            (info.node['ctx'].children || []).length > 0 && // Has children
            info.node['ctx'].expanded && // Is expanded
            dropPosition === 1 // On the bottom gap
        ) {
          loop(data, dropKey, item => {
            item.children = item.children || [];
            // where to insert 示例添加到尾部，可以是随意位置
            item.children.unshift(dragObj);
          });
        } else {
          let ar;
          let i;
          loop(data, dropKey, (item, index, arr) => {
            ar = arr;
            i = index;
          });
          if (dropPosition === -1) {
            ar.splice(i, 0, dragObj);
          } else {
            ar.splice(i + 1, 0, dragObj);
          }
        }
        this.gData = data;
      }
    }
  };
</script>
