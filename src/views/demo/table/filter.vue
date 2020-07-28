<template>
  <code-box>
    <a-table :data-source="data"
             :columns="columns">
      <template v-slot:filterDropdown="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }">
        <div style="padding: 8px">
          <a-input :ref="c => (searchInput = c)"
                   :placeholder="`Search ${column.dataIndex}`"
                   :value="selectedKeys[0]"
                   style="width: 188px; margin-bottom: 8px; display: block;"
                   @change="e => setSelectedKeys(e.target.value ? [e.target.value] : [])"
                   @pressEnter="() => handleSearch(selectedKeys, confirm, column.dataIndex)"/>
          <a-button type="primary"
                    icon="search"
                    size="small"
                    style="width: 90px; margin-right: 8px"
                    @click="() => handleSearch(selectedKeys, confirm, column.dataIndex)">
            Search
          </a-button>
          <a-button size="small"
                    style="width: 90px"
                    @click="() => handleReset(clearFilters)">
            Reset
          </a-button>
        </div>
      </template>
      <template v-slot:filterIcon="filtered">
        <a-icon type="search"
                :style="{ color : filtered ? '#108ee9' : undefined }"
        />
      </template>
      <template v-slot:customRender="text, record, index, column">
        <span v-if="searchText && searchedColumn === column.dataIndex">
          <template v-for="(fragment, i) in text
            .toString()
            .split(new RegExp(`(?<=${searchText})|(?=${searchText})`, 'i'))">
            <mark v-if="fragment.toLowerCase() === searchText.toLowerCase()"
                  :key="i"
                  class="highlight"
            >{{ fragment }}
            </mark
            >
            <template v-else>{{ fragment }}</template>
          </template>
        </span>
        <template v-else>
          {{ text }}
        </template>
      </template>
    </a-table>
  </code-box>
</template>
<script lang="tsx">
  import CodeBox from '@/views/demo/code-box.vue';
  import {defineComponent, ref} from 'vue';

  const data = [
    {
      key: '1',
      name: 'John Brown',
      age: 32,
      address: 'New York No. 1 Lake Park'
    },
    {
      key: '2',
      name: 'Joe Black',
      age: 42,
      address: 'London No. 1 Lake Park'
    },
    {
      key: '3',
      name: 'Jim Green',
      age: 32,
      address: 'Sidney No. 1 Lake Park'
    },
    {
      key: '4',
      name: 'Jim Red',
      age: 32,
      address: 'London No. 2 Lake Park'
    }
  ];

  export default defineComponent({
    name: 'TableFilterDemo',
    components: {CodeBox},
    data() {
      return {};
    },
    setup($props, {emit}) {
      const searchText = ref('');
      const searchedColumn = ref('');
      const searchInput = ref(null);
      const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        searchText.value = selectedKeys[0];
        searchedColumn.value = dataIndex;
      };
      const handleReset = (clearFilters) => {
        clearFilters();
        searchText.value = '';
      };
      return {
        data,
        searchText,
        searchInput,
        searchedColumn,
        columns: [
          {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            slots: {
              filterDropdown: 'filterDropdown',
              filterIcon: 'filterIcon',
              customRender: 'customRender'
            },
            onFilter: (value, record) =>
                record.name
                    .toString()
                    .toLowerCase()
                    .includes(value.toLowerCase()),
            onFilterDropdownVisibleChange: visible => {
              if (visible) {
                setTimeout(() => {
                  console.log(3)
                  searchInput.value.focus();
                }, 0);
              }
            }
          },
          {
            title: 'Age',
            dataIndex: 'age',
            key: 'age',
            slots: {
              filterDropdown: 'filterDropdown',
              filterIcon: 'filterIcon',
              customRender: 'customRender'
            },
            onFilter: (value, record) => {
              console.log(value);
              return record.age
                  .toString()
                  .toLowerCase()
                  .includes(value.toLowerCase());
            },
            onFilterDropdownVisibleChange: visible => {
              if (visible) {
                setTimeout(() => {
                  console.log(2)
                  searchInput.value.focus();
                });
              }
            }
          },
          {
            title: 'Address',
            dataIndex: 'address',
            key: 'address',
            slots: {
              filterDropdown: 'filterDropdown',
              filterIcon: 'filterIcon',
              customRender: 'customRender'
            },
            onFilter: (value, record) =>
                record.address
                    .toString()
                    .toLowerCase()
                    .includes(value.toLowerCase()),
            onFilterDropdownVisibleChange: visible => {
              if (visible) {
                setTimeout(() => {
                  console.log(1)
                  searchInput.value.focus();
                });
              }
            }
          }
        ],
        handleSearch,
        handleReset,
        onBlur() {
          console.log('blur')
        },
        onClick() {
          console.log('click');
        }
      };
    }
  });
</script>
<style scoped>
  .highlight {
    background-color: rgb(255, 192, 105);
    padding: 0px;
  }
</style>
