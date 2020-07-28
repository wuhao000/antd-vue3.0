<template>
  <code-box>
    <a-card hoverable
            style="width: 300px">
      <template v-slot:cover>
        <img alt="example"
             src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
        />
      </template>
      <template v-slot:actions
                class="ant-card-actions">
        <a-icon key="setting"
                type="setting"/>
        <a-icon key="edit"
                type="edit"/>
        <a-icon key="ellipsis"
                type="ellipsis"/>
      </template>
      <a-card-meta title="Card title"
                   description="This is the description">
        <template v-slot="avatar">
          <a-avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"
          />
        </template>
      </a-card-meta>
    </a-card>
  </code-box>
</template>
<script>
  import CodeBox from '../code-box';
  export default {
    name: 'CardMoreContentDemo',
    components: { CodeBox }
  }
</script>
