import Checkbox from '@/components/checkbox';
import Grid from '@/components/grid';
import Icon from '@/components/icon';
import Input from '@/components/input';
import Menu from '@/components/menu';
import VueIcon from '@/libs/icons-vue';
import DemoWrapper from '@/views/demo/demo-wrapper';
import {createApp} from 'vue';
import App from './App.vue';
import Button from './components/button';
import Layout from './components/layout';
import Router from './router';
import Radio from './components/radio';
import './style';
import Select from './components/select';
import CodeBox from './views/demo/code-box.vue';


if (window.AntDesignIcons) {
  // 注册 ant design icons, 共721个icon
  const icons = window.AntDesignIcons;
  Object.keys(icons).forEach(icon => {
    VueIcon.add(icons[icon]);
  });
}
const app = createApp(App);
app.config.warnHandler = (m) => {
};
app.component(CodeBox.name, CodeBox);
app.component(DemoWrapper.name, DemoWrapper);
app.use(Router);
app.use(Menu);
app.use(Layout);
app.use(Grid);
app.use(Checkbox);
app.use(Select);
app.use(Icon as any);
app.use(Input as any);
app.use(Radio);
app.use(Button as any);
app.mount('#app');
