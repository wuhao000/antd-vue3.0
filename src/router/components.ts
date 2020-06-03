import { RouteRecordRaw } from 'vue-router';

export default [{
  path: 'button',
  name: 'Button 按钮',
  component: () => import('../views/demo/button/index.vue'),
  meta: {
    tag: '通用' 
  }
}, {
  path: 'affix',
  name: 'Affix 图钉',
  component: () => import('../views/demo/affix/index.vue'),
  meta: {
    tag: '导航' 
  }
}, {
  path: 'tree',
  name: 'Tree 树形控件',
  component: () => import('../views/demo/tree/index.vue'),
  meta: {
    tag: '数据展示' 
  }
}, {
  path: 'calendar',
  name: 'Calendar 日历',
  component: () => import('../views/demo/calendar/index.vue'),
  meta: {
    tag: '数据入口' 
  }
}, {
  path: 'card',
  name: 'Card 卡片',
  component: () => import('../views/demo/card/index.vue'),
  meta: {
    tag: '数据展示' 
  }
}, {
  path: 'dropdown',
  name: 'Dropdown dropdown',
  component: () => import('../views/demo/dropdown/index.vue'),
  meta: {
    tag: '数据展示' 
  }
}, {
  path: 'checkbox',
  name: 'Checkbox 复选框',
  component: () => import('../views/demo/checkbox/index.vue'),
  meta: {
    tag: '数据入口' 
  }
}, {
  path: 'date-picker',
  name: 'DatePicker 日期选择',
  component: () => import('../views/demo/date-picker/index.vue'),
  meta: {
    tag: '数据入口' 
  }
}, {
  path: 'grid',
  name: 'Grid 宫格',
  component: () => import('../views/demo/grid/index.vue'),
  meta: {
    tag: '布局' 
  }
}, {
  path: 'layout',
  name: 'Layout 布局',
  component: () => import('../views/demo/layout/index.vue'),
  meta: {
    tag: '布局' 
  }
}, {
  path: 'icon',
  name: 'Icon 图标',
  component: () => import('../views/demo/icon/index.vue'),
  meta: {
    tag: '通用' 
  }
}, {
  path: 'input',
  name: 'Input 输入框',
  component: () => import('../views/demo/input/index.vue'),
  meta: {
    tag: '数据入口' 
  }
}, {
  path: 'menu',
  name: 'Menu 菜单',
  component: () => import('../views/demo/menu/index.vue'),
  meta: {
    tag: '导航' 
  }
}, {
  path: 'modal',
  name: 'Modal 模态框',
  component: () => import('../views/demo/modal/index.vue'),
  meta: {
    tag: '反馈' 
  }
}, {
  path: 'pagination',
  name: 'Pagination 分页器',
  component: () => import('../views/demo/pagination/index.vue'),
  meta: {
    tag: '导航' 
  }
}, {
  path: 'progress',
  name: 'Progress 进度条',
  component: () => import('../views/demo/progress/index.vue'),
  meta: {
    tag: '反馈' 
  }
}, {
  path: 'radio',
  name: 'Radio 单选',
  component: () => import('../views/demo/radio/index.vue'),
  meta: {
    tag: '数据入口' 
  }
}, {
  path: 'switch',
  name: 'Switch 开关',
  component: () => import('../views/demo/switch/index.vue'),
  meta: {
    tag: '数据入口' 
  }
}, {
  path: 'tabs',
  name: 'Tabs 标签页',
  component: () => import('../views/demo/tabs/index.vue'),
  meta: {
    tag: '导航' 
  }
}, {
  path: 'tag',
  name: 'Tag 标签',
  component: () => import('../views/demo/tag/index.vue'),
  meta: {
    tag: '数据展示' 
  }
}, {
  path: 'upload',
  name: 'Upload 上传',
  component: () => import('../views/demo/upload/index.vue'),
  meta: {
    tag: '数据入口' 
  }
}] as RouteRecordRaw[];


