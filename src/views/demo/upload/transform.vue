<template>
  <code-box>
    <a-upload action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
              :transform-file="transformFile"
    >
      <a-button>
        <a-icon type="upload"/>
        Upload
      </a-button>
    </a-upload>
  </code-box>
</template>
<script>
  export default {
    name: 'uploadTransform',
    methods: {
      transformFile(file) {
        return new Promise(resolve => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
            const canvas = document.createElement('canvas');
            const img = document.createElement('img');
            img.src = reader.result;
            img.onload = () => {
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0);
              ctx.fillStyle = 'red';
              ctx.textBaseline = 'middle';
              ctx.fillText('Ant Design', 20, 20);
              canvas.toBlob(resolve);
            };
          };
        });
      },
    },
  };
</script>
