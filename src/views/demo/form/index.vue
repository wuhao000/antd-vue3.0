<template>
  <a-form inline>
    <a-form-item label="aaaaaa">
      <a-input/>
    </a-form-item>
  </a-form>
</template>
<script lang="ts">
  import AForm from '@/components/form';
  import AInput from '@/components/input';

  export default {
    components: {AForm, AInput, AFormItem: AForm.Item}
  };
</script>
