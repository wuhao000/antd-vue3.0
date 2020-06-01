<template>
  <code-box>
    <a-dropdown :trigger="['contextmenu']">
      <div
          :style="{
        textAlign: 'center',
        background: '#f7f7f7',
        height: '200px',
        lineHeight: '200px',
        color: '#777',
      }"
      >
        Right Click on here
      </div>
      <template v-slot:overlay>
        <a-menu>
          <a-menu-item key="1">
            1st menu item
          </a-menu-item>
          <a-menu-item key="2">
            2nd menu item
          </a-menu-item>
          <a-menu-item key="3">
            3rd menu item
          </a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>
  </code-box>
</template>
<script>
  export default {
    name: 'DropdownContextmenuDemo'
  }
</script>
