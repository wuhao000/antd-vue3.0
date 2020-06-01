<template>
  <code-box>
    <a-dropdown-button @click="handleButtonClick">
      Dropdown
      <template v-slot:overlay>
        <a-menu @click="handleMenuClick">
          <a-menu-item key="1"> <a-icon type="user" />1st menu item </a-menu-item>
          <a-menu-item key="2"> <a-icon type="user" />2nd menu item </a-menu-item>
          <a-menu-item key="3"> <a-icon type="user" />3rd item </a-menu-item>
        </a-menu>
      </template>
    </a-dropdown-button>
    <a-dropdown-button>
      Dropdown
      <template v-slot:overlay>
        <a-menu @click="handleMenuClick">
          <a-menu-item key="1"> <a-icon type="user" />1st menu item </a-menu-item>
          <a-menu-item key="2"> <a-icon type="user" />2nd menu item </a-menu-item>
          <a-menu-item key="3"> <a-icon type="user" />3rd item </a-menu-item>
        </a-menu>
      </template>
      <template v-slot:icon>
        <a-icon type="user" />
      </template>
    </a-dropdown-button>
    <a-dropdown-button disabled style="margin-left: 8px" @click="handleButtonClick">
      Dropdown
      <template v-slot:overlay>
        <a-menu @click="handleMenuClick">
          <a-menu-item key="1"> <a-icon type="user" />1st menu item </a-menu-item>
          <a-menu-item key="2"> <a-icon type="user" />2nd menu item </a-menu-item>
          <a-menu-item key="3"> <a-icon type="user" />3rd item </a-menu-item>
        </a-menu>
      </template>

    </a-dropdown-button>
    <a-dropdown>
      <template v-slot:overlay>
        <a-menu @click="handleMenuClick">
          <a-menu-item key="1"> <a-icon type="user" />1st menu item </a-menu-item>
          <a-menu-item key="2"> <a-icon type="user" />2nd menu item </a-menu-item>
          <a-menu-item key="3"> <a-icon type="user" />3rd item </a-menu-item>
        </a-menu>
      </template>
      <a-button style="margin-left: 8px"> Button <a-icon type="down" /> </a-button>
    </a-dropdown>
  </code-box>
</template>

<script>
  import CodeBox from '../code-box';
  export default {
    name: 'DropdownButtonDemo',
    components: { CodeBox },
    methods: {
      handleButtonClick(e) {
        console.log('click left button', e);
      },
      handleMenuClick(e) {
        console.log('click', e);
      },
    },
  };
</script>
