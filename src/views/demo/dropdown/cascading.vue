<template>
  <code-box>
    <a-dropdown>
      <a class="ant-dropdown-link"
         @click="e => e.preventDefault()">
        Cascading menu
        <a-icon type="down"/>
      </a>
      <template v-slot:overlay>
        <a-menu>
          <a-menu-item>1st menu item</a-menu-item>
          <a-menu-item>2nd menu item</a-menu-item>
          <a-sub-menu key="test"
                      title="sub menu">
            <a-menu-item>3rd menu item</a-menu-item>
            <a-menu-item>4th menu item</a-menu-item>
          </a-sub-menu>
          <a-sub-menu title="disabled sub menu" disabled>
            <a-menu-item>5d menu item</a-menu-item>
            <a-menu-item>6th menu item</a-menu-item>
          </a-sub-menu>
        </a-menu>
      </template>
    </a-dropdown>
  </code-box>
</template>
<script>
  import CodeBox from '../code-box';
  export default {
    name: 'DropdownCascadingDemo',
    components: { CodeBox }
  }
</script>
