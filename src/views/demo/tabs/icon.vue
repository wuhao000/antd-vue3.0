<template>
  <code-box>
    <a-tabs default-active-key="2">
      <a-tab-pane key="1">
        <template v-slot:tab>
          <span>
            <a-icon type="apple"/>
            Tab 1
          </span>
        </template>
        Tab 1
      </a-tab-pane>
      <a-tab-pane key="2">
        <template v-slot:tab>
          <span>
            <a-icon type="android"/>
            Tab 2
          </span>
        </template>
        Tab 2
      </a-tab-pane>
    </a-tabs>
  </code-box>
</template>
<script>
  import CodeBox from '../code-box';
  export default {
    name: 'TabsIconDemo',
    components: { CodeBox }
  };
</script>
