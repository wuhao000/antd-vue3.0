<template>
  <code-box>
    <a-card title="Card Title">
      <a-card-grid style="width:25%;text-align:center">
        Content
      </a-card-grid>
      <a-card-grid style="width:25%;text-align:center"
                   :hoverable="false">
        Content
      </a-card-grid>
      <a-card-grid style="width:25%;text-align:center">
        Content
      </a-card-grid>
      <a-card-grid style="width:25%;text-align:center">
        Content
      </a-card-grid>
      <a-card-grid style="width:25%;text-align:center">
        Content
      </a-card-grid>
      <a-card-grid style="width:25%;text-align:center">
        Content
      </a-card-grid>
      <a-card-grid style="width:25%;text-align:center">
        Content
      </a-card-grid>
      <a-card-grid style="width:25%;text-align:center">
        Content
      </a-card-grid>
    </a-card>
  </code-box>
</template>
<script>
  import CodeBox from '../code-box';
  export default {
    name: 'CardGridContentDemo',
    components: { CodeBox }
  }
</script>
