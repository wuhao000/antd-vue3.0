<template>
  <code-box>
    <a-switch
        default-checked
        checked-children="dark"
        un-checked-children="light"
        @change="changeTheme"
    />
    <br />
    <br />
    <a-menu
        style="width: 256px"
        :default-selected-keys="['1']"
        :default-open-keys="['sub1']"
        mode="inline"
        :theme="theme"
        :selected-keys="[current]"
        @click="handleClick"
    >
      <a-menu-item key="1">
        <a-icon type="mail" />
        Navigation One
      </a-menu-item>
      <a-menu-item key="2">
        <a-icon type="calendar" />
        Navigation Two
      </a-menu-item>
      <a-sub-menu key="sub1">
        <template v-slot:title>
          <span><a-icon type="appstore" /><span>Navigation Three</span></span>
        </template>
        <a-menu-item key="3">
          Option 3
        </a-menu-item>
        <a-menu-item key="4">
          Option 4
        </a-menu-item>
        <a-sub-menu key="sub1-2" title="Submenu">
          <a-menu-item key="5">
            Option 5
          </a-menu-item>
          <a-menu-item key="6">
            Option 6
          </a-menu-item>
        </a-sub-menu>
      </a-sub-menu>
      <a-sub-menu key="sub2">
        <template v-slot:title>
          <span><a-icon type="setting" /><span>Navigation Four</span></span>
        </template>
        <a-menu-item key="7">
          Option 7
        </a-menu-item>
        <a-menu-item key="8">
          Option 8
        </a-menu-item>
        <a-menu-item key="9">
          Option 9
        </a-menu-item>
        <a-menu-item key="10">
          Option 10
        </a-menu-item>
      </a-sub-menu>
    </a-menu>
  </code-box>
</template>
<script>
  export default {
    name: "MenuThemeDemo",
    data() {
      return {
        current: '1',
        theme: 'dark',
      };
    },
    methods: {
      handleClick(e) {
        console.log('click ', e);
        this.current = e.key;
      },
      changeTheme(checked) {
        this.theme = checked ? 'dark' : 'light';
      },
    },
  };
</script>
