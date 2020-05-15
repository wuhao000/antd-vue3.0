import {App} from 'vue';
import antInputDirective from '../_util/antInputDirective';
import Base from '../base';
import Group from './group';
import Input from './input';
import Password from './password';
import Search from './search';
import TextArea from './textarea';


Input.Group = Group;
Input.Search = Search;
Input.TextArea = TextArea;
Input.Password = Password;

/* istanbul ignore next */
Input.install = function(app: App) {
  app.use(antInputDirective);
  app.use(Base);
  app.component(Input.name, Input);
  app.component(Input.Group.name, Input.Group);
  app.component(Input.Search.name, Input.Search);
  app.component(Input.TextArea.name, Input.TextArea);
  app.component(Input.Password.name, Input.Password);
};


export default Input;
