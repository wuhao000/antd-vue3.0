<template>
  <code-box>
    <a-radio-group :value="size" @change="handleSizeChange">
      <a-radio-button value="large">Large</a-radio-button>
      <a-radio-button value="default">Default</a-radio-button>
      <a-radio-button value="small">Small</a-radio-button>
    </a-radio-group>
    <br/><br/>
    <a-button type="primary" :size="size">Primary</a-button>
    <a-button :size="size">Normal</a-button>
    <a-button type="dashed" :size="size">Dashed</a-button>
    <a-button type="danger" :size="size">Danger</a-button>
    <a-button type="link" :size="size">Link</a-button>
    <br/>
    <a-button type="primary" icon="download" :size="size"/>
    <a-button type="primary" shape="circle" icon="download" :size="size"/>
    <a-button type="primary" shape="round" icon="download" :size="size">Download</a-button>
    <a-button type="primary" shape="round" icon="download" :size="size"/>
    <a-button type="primary" icon="download" :size="size">Download</a-button>
    <br/>
    <a-button-group :size="size">
      <a-button type="primary">
        <a-icon type="left"/>
        Backward
      </a-button>
      <a-button type="primary"> Forward
        <a-icon type="right"/>
      </a-button>
    </a-button-group>
  </code-box>
</template>
<script lang="tsx">
  import AButton from '@/components/button';
  import CodeBox from '@/views/demo/code-box.vue';
  import {ref} from 'vue';

  export default {
    name: 'ButtonSizeDemo',
    components: {CodeBox, AButton, AButtonGroup: AButton.Group},
    setup() {
      const size = ref('small');
      return {
        size,
        handleSizeChange(e) {
          size.value = e.target.value;
        }
      };
    }
  };
</script>
