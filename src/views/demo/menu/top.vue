<template>
  <code-box>
    <a-menu v-model:selectedKeys="current" mode="horizontal">
      <a-menu-item a="b" key="mail"><a-icon type="mail"/>Navigation One
      </a-menu-item>
      <a-menu-item key="app" disabled><a-icon type="appstore"/>Navigation Two
      </a-menu-item>
      <a-sub-menu>
        <template v-slot:title>
          <span class="submenu-title-wrapper">
            <a-icon type="setting"/>Navigation Three - Submenu
          </span>
        </template>
        <a-menu-item-group title="Item 1">
          <a-menu-item key="setting:1">
            Option 1
          </a-menu-item>
          <a-menu-item key="setting:2">
            Option 2
          </a-menu-item>
        </a-menu-item-group>
        <a-menu-item-group title="Item 2">
          <a-menu-item key="setting:3">
            Option 3
          </a-menu-item>
          <a-menu-item key="setting:4">
            Option 4
          </a-menu-item>
        </a-menu-item-group>
      </a-sub-menu>
      <a-menu-item key="alipay">
        <a href="https://antdv.com" target="_blank" rel="noopener noreferrer">Navigation Four - Link</a>
      </a-menu-item>
    </a-menu>
  </code-box>
</template>
<script lang="tsx">
  import CodeBox from '@/views/demo/code-box.vue';
  export default {
    name: 'MenuTopDemo',
    components: {CodeBox},
    setup() {
      return {
        current: ['mail']
      };
    }
  };
</script>
