import {App} from 'vue';
import Form from './src/form';
import Item from './src/form-item';

Form.Item = Item;

Form.install = (app: App) => {
  app.component(Form.name, Form);
  app.component(Form.Item.name, Form.Item);
};

export default Form;
