import Base from '../base';
import Checkbox from './checkbox';
import CheckboxGroup from './group';

Checkbox.Group = CheckboxGroup;

/* istanbul ignore next */
Checkbox.install = function(Vue) {
  Vue.use(Base);
  Vue.component(Checkbox.name, Checkbox);
  Vue.component(CheckboxGroup.name, CheckboxGroup);
};

export default Checkbox;
