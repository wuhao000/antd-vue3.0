import {App} from 'vue';
import ref from 'vue-ref';

export default {
  install: (app: App) => {
    app.use(ref, {name: 'ant-ref'});
  }
};
