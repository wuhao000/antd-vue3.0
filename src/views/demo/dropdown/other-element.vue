<template>
  <code-box>
    <a-dropdown>
      <a class="ant-dropdown-link"
         @click="e => e.preventDefault()">
        Hover me
        <a-icon type="down"/>
      </a>
      <template v-slot:overlay>
        <a-menu>
          <a-menu-item key="0">
            <a target="_blank"
               rel="noopener noreferrer"
               href="http://www.alipay.com/">1st menu item
            </a>
          </a-menu-item>
          <a-menu-item key="1">
            <a target="_blank"
               rel="noopener noreferrer"
               href="http://www.taobao.com/">2nd menu item
            </a>
          </a-menu-item>
          <a-menu-divider/>
          <a-menu-item key="3" disabled>
            3rd menu item（disabled）
          </a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>
  </code-box>
</template>
<script lang="ts">
  import CodeBox from '@/views/demo/code-box.vue';
  export default {
    name: 'DropdownOtherElementDemo',
    components: {CodeBox}
  };
</script>
