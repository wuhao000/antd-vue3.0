<template>
  <ul v-if="form.sex">
    <li v-for="i in form.sex">
      {{i}}
    </li>
  </ul>
  <a-form :label-col="{ span : 5 }"
          :wrapper-col="{ span : 12 }"
          :form="context"
          @submit="handleSubmit">
    <a-form-item label="Note"
                 :rules="[{trigger: 'change', required: true, message: 'Please input your note!' }]">
      <a-input v-model:value="form.name"/>
    </a-form-item>
    <a-form-item label="Gender"
                 :rules="[{ trigger: 'change', required: true, message: 'Please select your gender!' }]">
      <a-select placeholder="Select a option and change input text above"
                v-model:value="form.sex" allow-clear
                mode="tags"
                @change="handleSelectChange">
        <a-select-option value="male">
          male2
        </a-select-option>
        <a-select-option value="female">
          female2
        </a-select-option>
      </a-select>
    </a-form-item>
    <a-form-item :wrapper-col="{ span : 12, offset : 5 }">
      <a-button type="primary"
                html-type="submit">
        Submit
      </a-button>
    </a-form-item>
  </a-form>
</template>

<script lang="ts">
  import {reactive} from 'vue';

  export default {
    name: 'FormBasicDemo',
    setup() {
      const form = reactive({
        name: 'a',
        sex: null
      });
      const context = reactive({
        validate: null
      });
      const handleSubmit = (e) => {
        e.preventDefault();
        context.validate((err, values) => {
          if (!err) {
            console.log('Received values of form: ', values);
          }
        });
      };
      const handleSelectChange = (value) => {
        console.log(value);
      };
      return {
        formLayout: 'horizontal',
        context,
        form,
        handleSelectChange,
        handleSubmit
      };
    }
  };
</script>
