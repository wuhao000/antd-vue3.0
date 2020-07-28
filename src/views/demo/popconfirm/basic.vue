<template>
  <code-box>
    <a-popconfirm title="Are you sure delete this task?"
                  ok-text="Yes"
                  cancel-text="No"
                  @confirm="confirm"
                  @cancel="cancel">
      <a href="#">Delete</a>
    </a-popconfirm>
  </code-box>
</template>
<script lang="ts">
  import CodeBox from '@/views/demo/code-box.vue';

  export default {
    name: 'PopconfirmBasicDemo',
    components: {CodeBox},
    methods: {
      confirm(e) {
        console.log(e);
        // this.$message.success('Click on Yes');
      },
      cancel(e) {
        console.log(e);
        // Modal.$message.error('Click on No');
      }
    }
  };
</script>
