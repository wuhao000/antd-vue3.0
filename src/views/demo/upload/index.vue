<template>
  <demo-wrapper>
    <template v-slot:left>
      <upload-basic/>
      <upload-file-list/>
    </template>
    <template v-slot:right>
    
    </template>
  </demo-wrapper>
</template>
<script>
  import UploadBasic from './basic';
  import UploadFileList from './file-list';
  export default {
    components: { UploadFileList, UploadBasic }
  };
</script>
