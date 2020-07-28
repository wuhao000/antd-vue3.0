"use strict";
const fs = require('fs');
const PATH_PREFIX = 'src/views/demo';
function createDemo(id) {
    const dirPath = `${PATH_PREFIX}/${id}`;
    const indexFilePath = dirPath + '/index.vue';
    const basicDemoPath = dirPath + '/basic.vue';
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
    }
    if (!fs.existsSync(indexFilePath)) {
        fs.writeFileSync(indexFilePath, `<template>
  <demo-wrapper>
    <template v-slot:left>
    
    </template>
    <template v-slot:right>
    
    </template>
  </demo-wrapper>
</template>`);
    }
    if (!fs.existsSync(basicDemoPath)) {
        fs.writeFileSync(basicDemoPath, `<template>
  <code-box>
    <a-${id}></a-${id}>
  </code-box>
</template>
<script lang="ts">
  export default {
    name: '${id}BasicDemo'
  }
</script>
`);
    }
}
module.exports = createDemo;
