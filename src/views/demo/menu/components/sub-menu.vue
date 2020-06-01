<template>
  <a-sub-menu :key="menuInfo.key">
    <template v-slot:title>
      <span>
        <a-icon type="mail"/>
        <span>{{ menuInfo.title }}</span>
      </span>
    </template>
    <template v-for="item in menuInfo.children">
      <a-menu-item v-if="!item.children"
                   :key="item.key">
        <a-icon type="pie-chart"/>
        <span>{{ item.title }}</span>
      </a-menu-item>
      <sub-menu v-else
                :key="item.key"
                :menu-info="item"/>
    </template>
  </a-sub-menu>
</template>
<script>
  import Menu from '../../../../components/menu';

  export default {
    name: 'SubMenu',
    // must add isSubMenu: true
    props: {
      ...Menu.SubMenu.props,
      // Cannot overlap with properties within Menu.SubMenu.props
      menuInfo: {
        type: Object,
        default: () => ({})
      }
    },
    isSubMenu: true
  };
</script>
