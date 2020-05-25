<template>
  <a-form layout="inline" :form="form" @submit="handleSubmit">
    <a-form-item :rules="[{ required: true, message: 'Please input your username!' }]">
      <a-input placeholder="Username">
        <a-icon slot="prefix" type="user" style="color:rgba(0,0,0,.25)"/>
      </a-input>
    </a-form-item>
    <a-form-item :rules="[{ required: true, message: 'Please input your Password!' }]">
      <a-input
          type="password"
          placeholder="Password">
        <a-icon slot="prefix" type="lock" style="color:rgba(0,0,0,.25)"/>
      </a-input>
    </a-form-item>
    <a-form-item>
      <a-button type="primary" html-type="submit">
        Log in
      </a-button>
    </a-form-item>
  </a-form>
</template>
<script>
  function hasErrors(fieldsError) {
    return Object.keys(fieldsError).some(field => fieldsError[field]);
  }

  export default {
    name: 'FormInlineDemo',
    data() {
      return {
        hasErrors,
        form: {}
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
