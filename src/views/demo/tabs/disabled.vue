<template>
  <code-box meta="####禁用
禁用某一项。">
    <a-tabs default-active-key="1">
      <a-tab-pane key="1"
                  tab="Tab 1">
        Tab 1
      </a-tab-pane>
      <a-tab-pane key="2"
                  tab="Tab 2" disabled>
        Tab 2
      </a-tab-pane>
      <a-tab-pane key="3"
                  tab="Tab 3">
        Tab 3
      </a-tab-pane>
    </a-tabs>
  </code-box>
</template>
<script>
  import CodeBox from '../code-box';
  export default {
    name: 'TabsDisabledDemo',
    components: { CodeBox }
  };
</script>
