import VueIcon from '@/libs/icons-vue';
import moment from 'moment';
import {App} from 'vue';
import Avatar from './avatar';
import Badge from './badge';
import Button from './button';
import Calendar from './calendar';
import Card from './card';
import Checkbox from './checkbox';
import DatePicker from './date-picker';
import Empty from './empty';
import Form from './form';
import Grid from './grid';
import Icon from './icon';
import Input from './input';
import InputNumber from './input-number';
import Layout from './layout';
import Menu from './menu';
import Modal from './modal';
import zhCn from './moment-zh_CN';
import Pagination from './pagination';
import Radio from './radio';
import Rate from './rate';
import Select from './select';
import Spin from './spin';
import Switch from './switch';
import Tabs from './tabs';
import Tag from './tag';
import TimePicker from './time-picker';


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
    app.use(Card);
    app.use(Spin);
    app.use(Tabs);
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
    app.use(Badge);
    app.use(Calendar);
    app.use(Pagination);
    app.use(Input);
    app.use(Menu);
    app.use(Modal);
    app.use(InputNumber);
    app.use(Form);
    app.use(Tag);
    app.use(TimePicker);
    app.use(Empty);
    app.use(Avatar);
  }
};
