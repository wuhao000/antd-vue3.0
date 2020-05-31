<template>
  <code-box>
    <a-popconfirm title="Are you sure？">
      <template v-slot:icon>
        <a-icon type="question-circle-o"
            style="color: red"/>
      </template>
      <a href="#">Delete</a>
    </a-popconfirm>
  </code-box>
</template>
<script>
  import CodeBox from '../code-box';
  export default {
    name: 'PopconfirmIconDemo',
    components: { CodeBox }
  }
</script>
