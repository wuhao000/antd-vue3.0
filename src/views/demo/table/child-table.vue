<template>
  <a-table :columns="columns"
           :data-source="data"
           class="components-table-demo-nested">
    <template v-slot:operation="text">
      <a>Publish</a>
    </template>
    <template v-slot:expandedRowRender="text">
      <a-table :columns="innerColumns"
               :data-source="innerData"
               :pagination="false">
        <template v-slot:status="text">
          <span>
            <a-badge status="success"/>
            Finished </span>
        </template>
        <template v-slot:operation="text">
          <span class="table-operation">
            <a>Pause</a>
            <a>Stop</a>
            <a-dropdown>
              <template v-slot:overlay>
                <a-menu>
                  <a-menu-item>
                    Action 1
                  </a-menu-item>
                  <a-menu-item>
                    Action 2
                  </a-menu-item>
                </a-menu>
              </template>
              <a> More
                <a-icon type="down"/>
              </a>
            </a-dropdown>
          </span>
        </template>
      </a-table>
    </template>
  </a-table>
</template>
<script>
  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Platform', dataIndex: 'platform', key: 'platform' },
    { title: 'Version', dataIndex: 'version', key: 'version' },
    { title: 'Upgraded', dataIndex: 'upgradeNum', key: 'upgradeNum' },
    { title: 'Creator', dataIndex: 'creator', key: 'creator' },
    { title: 'Date', dataIndex: 'createdAt', key: 'createdAt' },
    { title: 'Action', key: 'operation', slots: { customRender: 'operation' } },
  ];

  const data = [];
  for (let i = 0; i < 3; ++i) {
    data.push({
      key: i,
      name: 'Screem',
      platform: 'iOS',
      version: '10.3.4.5654',
      upgradeNum: 500,
      creator: 'Jack',
      createdAt: '2014-12-24 23:12:00',
    });
  }

  const innerColumns = [
    { title: 'Date', dataIndex: 'date', key: 'date' },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Status', key: 'state', slots: { customRender: 'status' } },
    { title: 'Upgrade Status', dataIndex: 'upgradeNum', key: 'upgradeNum' },
    {
      title: 'Action',
      dataIndex: 'operation',
      key: 'operation',
      slots: { customRender: 'operation' },
    },
  ];

  const innerData = [];
  for (let i = 0; i < 3; ++i) {
    innerData.push({
      key: i,
      date: '2014-12-24 23:12:00',
      name: 'This is production name',
      upgradeNum: 'Upgraded: 56',
    });
  }

  export default {
    name: 'TableChildDemo',
    data() {
      return {
        data,
        columns,
        innerColumns,
        innerData,
      };
    },
  };
</script>
