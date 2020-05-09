import Button from './button';
import ButtonGroup from './button-group';
import Base from '../base';
import { App } from 'vue';

Button.Group = ButtonGroup;

/* istanbul ignore next */
Button.install = (app: App) => {
  app.use(Base);
  app.component(Button.name, Button);
  app.component(ButtonGroup.name, ButtonGroup);
};

export default Button;
