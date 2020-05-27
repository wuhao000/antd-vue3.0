<template>
  <code-box>
    <a-tabs>
      <a-tab-pane key="1"
                  tab="Tab 1">
        Content of tab 1
      </a-tab-pane>
      <a-tab-pane key="2"
                  tab="Tab 2">
        Content of tab 2
      </a-tab-pane>
      <a-tab-pane key="3"
                  tab="Tab 3">
        Content of tab 3
      </a-tab-pane>
      <template v-slot:tabBarExtraContent>
        <a-button>
          Extra Action
        </a-button>
      </template>
    </a-tabs>
  </code-box>
</template>
<script lang="tsx">
  import CodeBox from '@/views/demo/code-box.vue';
  export default {
    name: 'TabsExtraDemo',
    components: {CodeBox}
  };
</script>
