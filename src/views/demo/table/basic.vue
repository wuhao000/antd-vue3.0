<template>
  <code-box meta="#### 基本用法
简单的表格，最后一列是各种操作。">
    <a-table :columns="columns"
             :data-source="data">
      <template v-slot:name="text">
        <a>{{ text }}</a>
      </template>
      <template v-slot:customTitle>
        <span><a-icon type="smile-o"/> Name</span>
      </template>
      <template v-slot:tags="tags">
        <span>
          <a-tag v-for="tag in tags"
                 :key="tag"
                 :color="tag === 'loser' ? 'volcano' : tag.length > 5 ? 'geekblue' : 'green'">
            {{ tag.toUpperCase() }}
          </a-tag>
        </span>
      </template>
      <template v-slot:action="text, record">
      <span>
        <a>Invite 一 {{ record.name }}</a>
        <a-divider type="vertical"/>
        <a>Delete</a>
        <a-divider type="vertical"/>
        <a class="ant-dropdown-link"> More actions <a-icon type="down"/> </a>
      </span>
      </template>
    </a-table>
  </code-box>
</template>
<script>
  import CodeBox from '../code-box';
  const columns = [
    {
      dataIndex: 'name',
      key: 'name',
      slots: {
        title: 'customTitle',
        customRender: 'name'
      }
    },
    {
      title: 'Age',
      dataIndex: 'age',
      key: 'age'
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address'
    },
    {
      title: 'Tags',
      key: 'tags',
      dataIndex: 'tags',
      slots: { customRender: 'tags' }
    },
    {
      title: 'Action',
      key: 'action',
      slots: { customRender: 'action' }
    }
  ];

  const data = [
    {
      key: '1',
      name: 'John Brown',
      age: 32,
      address: 'New York No. 1 Lake Park',
      tags: ['nice', 'developer']
    },
    {
      key: '2',
      name: 'Jim Green',
      age: 42,
      address: 'London No. 1 Lake Park',
      tags: ['loser']
    },
    {
      key: '3',
      name: 'Joe Black',
      age: 32,
      address: 'Sidney No. 1 Lake Park',
      tags: ['cool', 'teacher']
    }
  ];

  export default {
    components: { CodeBox },
    data() {
      return {
        data,
        columns
      };
    }
  };
</script>
