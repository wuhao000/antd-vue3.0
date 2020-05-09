<template>
  <code-box :meta="meta">
    <div :style="{ borderBottom: '1px solid #E9E9E9' }">
      <a-checkbox :indeterminate="indeterminate"
                  @change="onCheckAllChange"
                  :checked="checkAll">
        Check all
      </a-checkbox>
    </div>
    <br/>
    <a-checkbox-group :options="plainOptions"
                      v-model:value="checkedList"/>
  </code-box>
</template>
<script lang="tsx">
  import {computed, ref, getCurrentInstance} from 'vue';
  import CodeBox from '../code-box.vue';

  const plainOptions = ['Apple', 'Pear', 'Orange'];
  const defaultCheckedList = ['Apple', 'Orange'];
  export default {
    name: 'SelectAllDemo',
    components: {CodeBox},
    setup() {
      console.log(getCurrentInstance());
      const checkedList = ref(defaultCheckedList);
      const onCheckAllChange = (e) => {
        checkedList.value = e.target.checked ? plainOptions : [];
      };
      return {
        indeterminate: computed(() => {
          return !!checkedList.value.length && checkedList.value.length < plainOptions.length;
        }),
        checkAll: computed(() => {
          return checkedList.value.length === plainOptions.length;
        }),
        plainOptions,
        checkedList,
        meta: `####全选
在实现全选效果时，你可能会用到indeterminate属性`,
        onCheckAllChange,
        onChange(v) {
          checkedList.value = v;
        }
      };
    },
    methods: {}
  };
</script>
