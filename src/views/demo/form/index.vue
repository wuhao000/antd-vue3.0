<template>
  <demo-wrapper>
    <form-basic-demo/>
  </demo-wrapper>
</template>
<script lang="ts">
  import AForm from '@/components/form';
  import AInput from '@/components/input';
  import FormBasicDemo from '@/views/demo/form/basic.vue';

  export default {
    components: {FormBasicDemo, AForm, AInput, AFormItem: AForm.Item},
    setup() {
      const form = {
        input: 'a'
      };
      return {form};
    }
  };
</script>
