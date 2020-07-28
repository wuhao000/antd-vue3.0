<template>
  <a-input placeholder="input with clear icon"
           :allow-clear="true"
           @change="onChange"/>
  <br/>
  <br/>
  <a-textarea placeholder="textarea with clear icon" allowClear
              @change="onChange"/>
</template>
<script lang="tsx">
  import CodeBox from '@/views/demo/code-box.vue';
  import {defineComponent} from 'vue';

  export default defineComponent({
    name: 'InputClearDemo',
    components: {CodeBox},
    setup() {
      return {
        onChange: (e) => {
        },
        meta: `####带移除图标
带移除图标的输入框，点击图标删除所有内容`
      };
    }
  });
</script>
