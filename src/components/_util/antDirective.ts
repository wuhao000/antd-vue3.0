import {App} from 'vue';
import ref from 'vue-ref';
import {antInput} from './antInputDirective';
import {antDecorator} from './FormDecoratorDirective';

export default {
  install: (app: App) => {
    app.use(ref, {name: 'ant-ref'});
    antInput(app);
    antDecorator(app);
  }
};
