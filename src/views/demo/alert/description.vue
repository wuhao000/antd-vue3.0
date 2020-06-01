<template>
  <code-box>
    <a-alert message="Success Text" type="success">
      <p slot="description">
        Success Description <span style="color: red">Success</span> Description Success Description
      </p>
    </a-alert>
    <a-alert
        message="Info Text"
        description="Info Description Info Description Info Description Info Description"
        type="info"
    />
    <a-alert
        message="Warning Text"
        description="Warning Description Warning Description Warning Description Warning Description"
        type="warning"
    />
    <a-alert
        message="Error Text"
        description="Error Description Error Description Error Description Error Description"
        type="error"
    />
  </code-box>
</template>
<script>
  import CodeBox from '../code-box';
  export default {
    name: 'AlertDescription',
    components: { CodeBox }
  }
</script>
