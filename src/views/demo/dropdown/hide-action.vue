<template>
  <code-box>
    <a-dropdown v-model:visible="visible">
      <a class="ant-dropdown-link" @click="e => e.preventDefault()">
        Hover me <a-icon type="down" />
      </a>
      <template v-slot:overlay>
        <a-menu @click="handleMenuClick">
          <a-menu-item key="1">
            Clicking me will not close the menu.
          </a-menu-item>
          <a-menu-item key="2">
            Clicking me will not close the menu also.
          </a-menu-item>
          <a-menu-item key="3">
            Clicking me will close the menu
          </a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>
  </code-box>
</template>

<script>
  import CodeBox from '../code-box';
  export default {
    name: 'DropdownHideActionDemo',
    components: { CodeBox },
    data() {
      return {
        visible: false,
      };
    },
    methods: {
      handleMenuClick(e) {
        this.visible = e.key !== '3';
      },
    },
  };
</script>
