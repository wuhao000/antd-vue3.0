<template>
  <demo-wrapper>
    <template v-slot:left>
      <upload-basic/>
      <upload-file-list/>
      <upload-controlled-list/>
      <upload-image/>
      <upload-directory/>
      <upload-transform/>
    </template>
    <template v-slot:right>
      <upload-avatar/>
      <upload-image-wall/>
      <upload-drag/>
      <upload-manual/>
    </template>
  </demo-wrapper>
</template>
<script>
  import UploadBasic from './basic';
  import UploadFileList from './file-list';
  import UploadControlledList from './controlled-list';
  import UploadImage from './image';
  import UploadDirectory from './directory';
  import UploadTransform from './transform';
  import UploadAvatar from './avatar';
  import UploadImageWall from './image-wall';
  import UploadDrag from './drag';
  import UploadManual from './manual';

  export default {
    components: {
      UploadManual,
      UploadDrag,
      UploadImageWall,
      UploadAvatar,
      UploadTransform,
      UploadDirectory,
      UploadImage,
      UploadControlledList,
      UploadFileList,
      UploadBasic
    }
  };
</script>
