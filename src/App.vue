<template>
  <a-layout>
    <a-layout-header id="header"
                     height="100px">
    </a-layout-header>
    <a-layout>
      <a-layout-sider class="left-nav">
        <a-menu mode="inline"
                theme="light">
          <a-sub-menu>
            <template v-slot:title>
              <span>组件</span>
            </template>
            <a-menu-item-group v-for="group in components"
                               :title="group.title">
              <a-menu-item v-for="item in group.children"
                           :key="item.id">
                <router-link :to="pathPrefix + '/' + item.id">{{item.title}}</router-link>
              </a-menu-item>
            </a-menu-item-group>
          </a-sub-menu>
        </a-menu>
      </a-layout-sider>
      <a-layout-content class="main-container">
        <router-view/>
      </a-layout-content>
    </a-layout>
    <a-layout-footer height="40px">
    </a-layout-footer>
  </a-layout>
</template>
<script lang="tsx">
  import {defineComponent, h} from 'vue';
  import AIcon from './components/icon';
  import InputDemo from './views/demo/menu/index.vue';

  export default defineComponent({
    components: {
      InputDemo,
      AIcon
    },
    setup() {
      return {
        components: [{
          title: '通用',
          children: [{
            id: 'button',
            title: 'Button'
          }, {
            id: 'icon',
            title: 'Icon'
          }]
        }, {
          title: '布局',
          children: [{
            id: 'grid',
            title: 'Grid'
          }, {
            id: 'layout',
            title: 'Layout'
          }]
        }, {
          title: '数据',
          children: [{
            id: 'checkbox',
            title: 'Checkbox'
          }, {
            id: 'input',
            title: 'Input'
          }, {
            id: 'radio',
            title: 'Radio'
          }, {
            id: 'select',
            title: 'Select'
          }, {
            id: 'form',
            title: 'Form'
          }]
        }],
        pathPrefix: '/components/demo'
      };
    }
  });
</script>
<style lang="less">
  img {
    width: 200px;
  }

  h1 {
    font-family: Arial, Helvetica, sans-serif;
  }

  .ant-layout-content {
    overflow-x: hidden;
    overflow-y: auto;

    &.main-container {
      padding: 0 200px 144px 64px;
    }
  }

  .left-nav {
    margin: 10px;
  }
</style>
