<template>
  <code-box style="background-color: #ececec; padding: 20px;">
    <a-row :gutter="16">
      <a-col :span="8">
        <a-card title="Card title"
                :bordered="false">
          <p>card content</p>
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card title="Card title"
                :bordered="false">
          <p>card content</p>
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card title="Card title"
                :bordered="false">
          <p>card content</p>
        </a-card>
      </a-col>
    </a-row>
  </code-box>
</template>
<script>
  import CodeBox from '../code-box';
  export default {
    name: 'CardGridDemo',
    components: { CodeBox }
  }
</script>
