<template>
  <code-box id="components-dropdown-demo-placement">
    <template v-for="(placement, index) in placements">
      <a-dropdown :placement="placement">
        <a-button>{{ placement }}</a-button>
        <template v-slot:overlay>
          <a-menu>
            <a-menu-item>
              <a target="_blank" rel="noopener noreferrer" href="http://www.alipay.com/"
              >1st menu item</a
              >
            </a-menu-item>
            <a-menu-item>
              <a target="_blank" rel="noopener noreferrer" href="http://www.taobao.com/"
              >2nd menu item</a
              >
            </a-menu-item>
            <a-menu-item>
              <a target="_blank" rel="noopener noreferrer" href="http://www.tmall.com/"
              >3rd menu item</a
              >
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
      <br v-if="index === 2" />
    </template>
  </code-box>
</template>

<script>
  export default {
    name: 'DropdownPositionDemo',
    data() {
      return {
        placements: ['bottomLeft', 'bottomCenter', 'bottomRight', 'topLeft', 'topCenter', 'topRight'],
      };
    },
  };
</script>
<style>
  #components-dropdown-demo-placement .ant-btn {
    margin-right: 8px;
    margin-bottom: 8px;
  }
</style>
