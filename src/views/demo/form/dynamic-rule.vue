<template>
  <code-box>
    <a-form :form="form">
      <a-form-item
          :label-col="formItemLayout.labelCol"
          :wrapper-col="formItemLayout.wrapperCol"
          :rules="[{ required: true, message: 'Please input your name' }]"
          label="Name">
        <a-input placeholder="Please input your name"/>
      </a-form-item>
      <a-form-item
          :rules="[{ required: checkNick, message: 'Please input your nickname' }]"
          :label-col="formItemLayout.labelCol"
          :wrapper-col="formItemLayout.wrapperCol"
          label="Nickname">
        <a-input
            placeholder="Please input your nickname"
        />
      </a-form-item>
      <a-form-item :label-col="formTailLayout.labelCol" :wrapper-col="formTailLayout.wrapperCol">
        <a-checkbox :checked="checkNick" @change="handleChange">
          Nickname is required
        </a-checkbox>
      </a-form-item>
      <a-form-item :label-col="formTailLayout.labelCol" :wrapper-col="formTailLayout.wrapperCol">
        <a-button type="primary" @click="check">
          Check
        </a-button>
      </a-form-item>
    </a-form>
  </code-box>
</template>
<script>
  import CodeBox from '@/views/demo/code-box';
  const formItemLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 8 }
  };
  const formTailLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 8, offset: 4 }
  };
  export default {
    name: 'DynamicRuleDemo',
    components: { CodeBox },
    data() {
      return {
        checkNick: false,
        formItemLayout,
        formTailLayout,
        form: {}
      };
    },
    methods: {
      check() {
        this.form.validate(err => {
          if (!err) {
            console.info('success');
          }
        });
      },
      handleChange(e) {
        this.checkNick = e.target.checked;
        this.$nextTick(() => {
          this.form.validateFields(['nickname'], { force: true });
        });
      }
    }
  };
</script>
