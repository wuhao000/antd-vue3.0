import Checkbox from '@/components/checkbox';
import Grid from '@/components/grid';
import Icon from '@/components/icon';
import Input from '@/components/input';
import Menu from '@/components/menu';
import VueIcon from '@/libs/icons-vue';
import Rate from '@/components/rate';
import DemoWrapper from '@/views/demo/demo-wrapper';
import {createApp} from 'vue';
import App from './views/app.vue';
import Button from './components/button';
import Layout from './components/layout';
import Router from './router';
import Radio from './components/radio';
import './style';
import Select from './components/select';
import Calendar from './components/calendar';
import CodeBox from './views/demo/code-box.vue';
import DatePicker from './components/date-picker';
import Switch from './components/switch';


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
app.use(Calendar);
app.use(Layout);
app.use(Rate);
app.use(Grid);
app.use(Switch)
app.use(Checkbox);
app.use(Select);
app.use(Icon);
app.use(Input);
app.use(DatePicker);
app.use(Radio);
app.use(Button);
app.mount('#app');
