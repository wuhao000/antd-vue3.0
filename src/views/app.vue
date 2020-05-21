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
        <modal-demo/>
        <router-view/>
      </a-layout-content>
    </a-layout>
    <a-layout-footer height="40px">
    </a-layout-footer>
  </a-layout>
</template>
<script lang="tsx" type="text/javascript">
  import { Vue, Options } from 'vue-class-component';
  import ModalDemo from './demo/modal/index.vue';

  @Options({
    components: {ModalDemo}
  })
  export default class App extends Vue {

    public components = [{
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
      title: '导航',
      children: [{
        id: 'menu',
        title: 'Menu'
      }]
    }, {
      title: '数据',
      children: [{
        id: 'checkbox',
        title: 'Checkbox'
      }, {
        id: 'calendar',
        title: 'Calendar'
      }, {
        id: 'date-picker',
        title: 'DatePicker'
      }, {
        id: 'switch',
        title: 'Switch'
      }, {
        id: 'input',
        title: 'Input'
      }, {
        id: 'radio',
        title: 'Radio'
      }, {
        id: 'rate',
        title: 'Rate'
      }, {
        id: 'select',
        title: 'Select'
      }, {
        id: 'form',
        title: 'Form'
      }]
    }, {
      title: '数据展示',
      children: [{
        id: 'tooltip',
        title: 'Tooltip'
      }]
    }];
    public pathPrefix = '/components/demo';
  }
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
