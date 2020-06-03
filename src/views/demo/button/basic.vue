<template>
  <div>
    <a-button type="primary">Primary</a-button>
    <a-button>Default</a-button>
    <a-button type="dashed">Dashed</a-button>
    <a-button type="danger">Danger</a-button>
    <AConfigProvider :autoInsertSpaceInButton="false">
      <AButton type="primary">按钮</AButton>
    </AConfigProvider>
    <AButton type="primary">按钮</AButton>
    <AButton type="link">Link</AButton>
  </div>
</template>
<script lang="ts">
  import AButton from '@/components/button';
  import CodeBox from '@/views/demo/code-box.vue';

  export default {
    components: {CodeBox, AButton},
    setup() {
      return {
        meta: `#### 按钮类型
按钮有五种类型：主按钮、次按钮、虚线按钮、危险按钮和链接按钮。主按钮在同一个操作区域最多出现一次。`
      };
    }
  };
</script>
