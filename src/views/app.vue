<template>
  <a-layout>
    <a-layout-header id="header"
                     height="100px">
    </a-layout-header>
    <a-layout>
      <a-layout-sider class="left-nav">
        <a-menu mode="inline"
                :default-open-keys="['components']"
                theme="light">
          <a-sub-menu key="components">
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
      <a-layout-content id="main-container" class="main-container">
        <router-view/>
      </a-layout-content>
    </a-layout>
    <a-layout-footer height="40px">
    </a-layout-footer>
  </a-layout>
</template>
<script lang="tsx">
  import components from '@/router/components';
  import {Options, Vue} from 'vue-class-component';
  import ModalDemo from './demo/modal/index.vue';

  function getComponents() {
    const map = {};
    components.forEach(c => {
      const tag = c.meta.tag;
      if (!map[tag]) {
        map[tag] = [];
      }
      map[tag].push(c);
    });
    const result = [];
    Object.keys(map).forEach(key => {
      const children = map[key].map(c => ({
        id: c.path,
        title: c.name
      }));
      result.push({
        title: key,
        children
      });
    });
    return result;
  }

  @Options({
    components: {ModalDemo}
  })
  export default class App extends Vue {

    public components = getComponents();
    public pathPrefix = '/components/demo';


    public keydown(e) {
      console.log(e.key + '/' + e.keyCode);
    }

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

  ::-webkit-scrollbar {
    height: 7px;
    width: 7px;
  }

  ::-webkit-scrollbar-thumb {
    background-color: rgba(50, 50, 50, .3);
    border-radius: 1em;
  }

  ::-webkit-scrollbar-track {
    background-color: rgba(50, 50, 50, .1);
    border-radius: 1em;
  }

  ::selection {
    background: #1890ff;
    color: #fff;
  }

  ::selection {
    background: #1890ff;
    color: #fff;
  }

  ::selection {
    background: #1890ff;
    color: #fff;
  }

  ::selection {
    color: #fff;
    background: #1890ff;
  }
</style>
