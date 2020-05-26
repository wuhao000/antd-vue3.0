<template>
  <code-box>
    <a-form layout="inline"
            v-model:has-error="hasError"
            :form="form"
            @submit="handleSubmit">
      <a-form-item :rules="[{trigger: 'blur',  required: true, message: 'Please input your username!' }]">
        <a-input placeholder="Username">
          <template v-slot:prefix>
            <a-icon type="user"
                    style="color:rgba(0,0,0,.25)"/>
          </template>
        </a-input>
      </a-form-item>
      <a-form-item :rules="[{trigger: 'blur',  required: true, message: 'Please input your Password!' }]">
        <a-input type="password"
                 placeholder="Password">
          <template v-slot:prefix>
            <a-icon type="lock"
                    style="color:rgba(0,0,0,.25)"/>
          </template>
        </a-input>
      </a-form-item>
      <a-form-item>
        <a-button type="primary"
                  :disabled="hasError"
                  html-type="submit">
          Log in
        </a-button>
      </a-form-item>
    </a-form>
  </code-box>
</template>
<script>
  import CodeBox from '@/views/demo/code-box';
  function hasErrors(fieldsError) {
    return Object.keys(fieldsError).some(field => fieldsError[field]);
  }

  export default {
    name: 'FormInlineDemo',
    components: { CodeBox },
    data() {
      return {
        hasErrors,
        form: {},
        hasError: false
      };
    },
    mounted() {
      this.$nextTick(() => {
        // To disabled submit button at the beginning.
        this.form.validate((errors) => {
          console.log(errors);
        });
      });
    },
    methods: {
      handleSubmit(e) {
        e.preventDefault();
        this.form.validate((err, values) => {
          if (!err) {
            console.log('Received values of form: ', values);
          }
        });
      }
    }
  };
</script>
