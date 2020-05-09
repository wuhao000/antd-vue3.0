import {App} from 'vue';
import antInputDirective from '../_util/antInputDirective';
import Base from '../base';
import Group from './Group';
import Input from './Input';
import Password from './Password';
import Search from './Search';
import TextArea from './TextArea';


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
