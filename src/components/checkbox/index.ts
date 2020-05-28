import Base from '../base';
import Checkbox from './checkbox';
import CheckboxGroup from './group';

Checkbox.Group = CheckboxGroup;

/* istanbul ignore next */
Checkbox.install = function(app) {
  app.use(Base);
  app.component(Checkbox.name, Checkbox);
  app.component(CheckboxGroup.name, CheckboxGroup);
};

export default Checkbox;
