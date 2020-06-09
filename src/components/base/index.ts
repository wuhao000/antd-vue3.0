import {App} from 'vue';
import antDirective from '../_util/ant-directive';

export default {
  install: (app: App) => {
    app.use(antDirective);
  }
};
