<template>
  <code-box>
    <a-table :columns="columns"
             :data-source="data" bordered>
      <template v-for="col in ['name', 'age', 'address']"
                v-slot:[col]="text, record, index">
        <div :key="col">
          <a-input v-if="record.editable"
                   style="margin: -5px 0"
                   :value="text"
                   @change="e => handleChange(e.target.value, record.key, col)"/>
          <template v-else>
            {{ text }}
          </template>
        </div>
      </template>
      <template v-slot:operation="text, record, index">
        <div class="editable-row-operations">
          <span v-if="record.editable">
            <a @click="() => save(record.key)">Save</a>
            <a-popconfirm title="Sure to cancel?"
                          @confirm="() => cancel(record.key)">
              <a>Cancel</a>
            </a-popconfirm>
          </span>
          <span v-else>
            <a v-if="editingKey !== ''"
               @click="() => edit(record.key)">Edit
            </a>
            <a v-else
               @click="() => edit(record.key)">Edit
            </a>
          </span>
        </div>
      </template>
    </a-table>
  </code-box>
</template>
<script lang="tsx">
  import CodeBox from '@/views/demo/code-box.vue';
  import {defineComponent, ref} from 'vue';

  const columns = [
    {
      title: 'name',
      dataIndex: 'name',
      width: '25%',
      slots: {customRender: 'name'}
    },
    {
      title: 'age',
      dataIndex: 'age',
      width: '15%',
      slots: {customRender: 'age'}
    },
    {
      title: 'address',
      dataIndex: 'address',
      width: '40%',
      slots: {customRender: 'address'}
    },
    {
      title: 'operation',
      dataIndex: 'operation',
      slots: {customRender: 'operation'}
    }
  ];

  const defaultData = [];
  for (let i = 0; i < 100; i++) {
    defaultData.push({
      key: i.toString(),
      name: `Edrward ${i}`,
      age: 32,
      address: `London Park no. ${i}`
    });
  }
  export default defineComponent({
    name: 'TableRowEditableDemo',
    components: {CodeBox},
    setup($props, {emit}) {
      const data = ref(defaultData);
      const cacheData = ref(defaultData.map(item => ({...item})));
      const editingKey = ref('');
      const handleChange = (value, key, column) => {
        const newData = [...data.value];
        const target = newData.filter(item => key === item.key)[0];
        if (target) {
          target[column] = value;
          data.value = newData;
        }
      };
      const edit = (key) => {
        const newData = [...data.value];
        const target = newData.filter(item => key === item.key)[0];
        editingKey.value = key;
        if (target) {
          target.editable = true;
          data.value = newData;
        }
      };
      const save = (key) => {
        const newData = [...data.value];
        const newCacheData = [...cacheData.value];
        const target = newData.filter(item => key === item.key)[0];
        const targetCache = newCacheData.filter(item => key === item.key)[0];
        if (target && targetCache) {
          delete target.editable;
          data.value = newData;
          Object.assign(targetCache, target);
          cacheData.value = newCacheData;
        }
        editingKey.value = '';
      };
      const cancel = (key) => {
        const newData = [...data.value];
        const target = newData.filter(item => key === item.key)[0];
        editingKey.value = '';
        if (target) {
          Object.assign(target, cacheData.value.filter(item => key === item.key)[0]);
          delete target.editable;
          data.value = newData;
        }
      };
      return {
        data,
        editingKey,
        handleChange,
        edit,
        save,
        cancel,
        columns
      };
    }
  });
</script>
<style scoped>
  .editable-row-operations a {
    margin-right: 8px;
  }
</style>
