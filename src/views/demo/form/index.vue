<template>
  <demo-wrapper>
    <form-basic-demo/>
    <dynamic-rule-demo/>
    <form-inline-demo/>
  </demo-wrapper>
</template>
<script lang="ts">
  import AForm from '@/components/form';
  import AInput from '@/components/input';
  import FormBasicDemo from '@/views/demo/form/basic.vue';
  import DynamicRuleDemo from '@/views/demo/form/dynamic-rule.vue';
  import FormInlineDemo from '@/views/demo/form/line.vue';

  export default {
    components: {FormInlineDemo, DynamicRuleDemo, FormBasicDemo, AForm, AInput, AFormItem: AForm.Item},
    setup() {
      const form = {
        input: 'a'
      };
      return {form};
    }
  };
</script>
