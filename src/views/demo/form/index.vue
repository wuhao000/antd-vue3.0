<template>
  <demo-wrapper>
<!--    <form-basic-demo/>-->
<!--    <dynamic-rule-demo/>-->
<!--    <form-inline-demo/>-->
<!--    <form-layout-demo/>-->
    <form-validate-demo/>
  </demo-wrapper>
</template>
<script lang="ts">
  import AForm from '@/components/form';
  import AInput from '@/components/input';
  import FormBasicDemo from '@/views/demo/form/basic.vue';
  import DynamicRuleDemo from '@/views/demo/form/dynamic-rule.vue';
  import FormLayoutDemo from '@/views/demo/form/layout.vue';
  import FormInlineDemo from '@/views/demo/form/line.vue';
  import FormValidateDemo from '@/views/demo/form/validate.vue';

  export default {
    components: {
      FormValidateDemo,
      FormLayoutDemo, FormInlineDemo, DynamicRuleDemo, FormBasicDemo, AForm, AInput, AFormItem: AForm.Item},
    setup() {
      const form = {
        input: 'a'
      };
      return {form};
    }
  };
</script>
