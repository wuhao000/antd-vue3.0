import DemoWrapper from '@/views/demo/demo-wrapper';
import {createApp} from 'vue';
import Antd from './components';

import Router from './router';
import './style';
import App from './views/app.vue';
import CodeBox from './views/demo/code-box.vue';


const app = createApp(App);
app.config.warnHandler = (m) => {
};
app.component(CodeBox.name, CodeBox);
app.component(DemoWrapper.name, DemoWrapper);
app.use(Router);
app.use(Antd);
app.mount('#app');
