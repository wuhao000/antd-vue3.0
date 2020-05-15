<template>
  <a-form inline>
    <a-form-item required label="aaaaaa" prop="input">
      <a-input v-model:value="form.input"/>
    </a-form-item>
  </a-form>
</template>
<script lang="ts">
  import AForm from '@/components/form';
  import AInput from '@/components/input';

  export default {
    components: {AForm, AInput, AFormItem: AForm.Item},
    setup() {
      const form = {
        input: 'a'
      };
      return {form};
    }
  };
</script>
