<template>
  <code-box>
    <a-dropdown trigger="click">
      <template v-slot:overlay>
        <input @click="onClick" @focus="onFocus" @blur="onBlur"/>
      </template>
      <a>test</a>
    </a-dropdown>
    <a-dropdown>
      <a class="ant-dropdown-link"
         @click="e => e.preventDefault()">
        Hover me
        <a-icon type="down"/>
      </a>
      <template v-slot:overlay>
        <a-menu>
          <a-menu-item>
            <a>1st menu item</a>
          </a-menu-item>
          <a-menu-item>
            <a>2nd menu item</a>
          </a-menu-item>
          <a-menu-item>
            <a>3rd menu item</a>
          </a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>
  </code-box>
</template>
<script lang="ts">
  export default {
    name: 'DropdownBasicDemo',
    setup() {
      return {
        onClick(e) {
          e.target.focus();
        },
        onFocus() {
          console.log('focus');
        },
        onBlur() {
          console.log('blur');
        }
      }
    }
  };
</script>
