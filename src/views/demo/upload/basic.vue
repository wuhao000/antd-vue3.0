<template>
  <code-box>
    <a-upload
        name="file"
        :multiple="true"
        action="https://yapi.aegis-info.com/mock/594/upload"
        :headers="headers"
        @change="handleChange">
      <a-button> <a-icon type="upload" /> Click to Upload </a-button>
    </a-upload>
  </code-box>
</template>
<script>
  import CodeBox from '../code-box';
  export default {
    name: 'uploadBasic',
    components: { CodeBox },
    data() {
      return {
        headers: {
          authorization: 'authorization-text',
        },
      };
    },
    methods: {
      handleChange(info) {
        // if (info.file.status !== 'uploading') {
        //   console.log(info.file, info.fileList);
        // }
        // if (info.file.status === 'done') {
        //   this.$message.success(`${info.file.name} file uploaded successfully`);
        // } else if (info.file.status === 'error') {
        //   this.$message.error(`${info.file.name} file upload failed.`);
        // }
      },
    },
  };
</script>
