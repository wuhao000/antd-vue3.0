import VueIcon from '@/libs/icons-vue';
import moment from 'moment';
import {App} from 'vue';
import Button from './button';
import Calendar from './calendar';
import Checkbox from './checkbox';
import DatePicker from './date-picker';
import Grid from './grid';
import Icon from './icon';
import Input from './input';
import InputNumber from './input-number';
import Layout from './layout';
import Menu from './menu';
import Modal from './modal';
import zhCn from './moment-zh_CN';
import Radio from './radio';
import Rate from './rate';
import Select from './select';
import Switch from './switch';
import Form from './form';
import Tag from './tag';


export default {
  install: (app: App) => {
    if (window.AntDesignIcons) {
      // 注册 ant design icons, 共721个icon
      const icons = window.AntDesignIcons;
      Object.keys(icons).forEach(icon => {
        VueIcon.add(icons[icon]);
      });
    }
    if (window.moment) {
      window.moment.updateLocale('zh-cn', zhCn);
    } else {
      moment.locale('zh-cn', zhCn);
    }
    app.use(DatePicker);
    app.use(Switch);
    app.use(Button);
    app.use(Layout);
    app.use(Grid);
    app.use(Icon);
    app.use(Radio);
    app.use(Checkbox);
    app.use(Rate);
    app.use(Select);
    app.use(Calendar);
    app.use(Input);
    app.use(Menu);
    app.use(Modal);
    app.use(InputNumber);
    app.use(Form);
    app.use(Tag);
  }
};
