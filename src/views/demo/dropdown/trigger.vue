<template>
  <code-box>
    <a-dropdown :trigger="['click']">
      <a class="ant-dropdown-link"
         @click="e => e.preventDefault()">
        Click me
        <a-icon type="down"/>
      </a>
      <template v-slot:overlay>
        <a-menu>
          <a-menu-item key="0">
            <a href="http://www.alipay.com/">1st menu item</a>
          </a-menu-item>
          <a-menu-item key="1">
            <a href="http://www.taobao.com/">2nd menu item</a>
          </a-menu-item>
          <a-menu-divider/>
          <a-menu-item key="3">
            3rd menu item
          </a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>
  </code-box>
</template>
<script>
  import CodeBox from '../code-box';
  export default {
    name: 'DropdownTriggerDemo',
    components: { CodeBox }
  }
</script>
