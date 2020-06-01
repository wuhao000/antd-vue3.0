<template>
  <code-box>
    <a-dropdown>
      <a class="ant-dropdown-link" @click="e => e.preventDefault()">
        Hover me, Click menu item <a-icon type="down" />
      </a>
      <template v-slot:overlay>
        <a-menu @click="onClick">
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
  import CodeBox from '../code-box';
  export default {
    name: 'DropdownClickItemDemo',
    components: { CodeBox },
    methods: {
      onClick({ key }) {
        console.log(`Click on item ${key}`);
      },
    },
  };
</script>
