import Spin, { setDefaultIndicator } from './spin';
import Base from '../base';

export { SpinProps } from './spin';

Spin.setDefaultIndicator = setDefaultIndicator;

/* istanbul ignore next */
Spin.install = function(Vue) {
  Vue.use(Base);
  Vue.component(Spin.name, Spin);
};

export default Spin;
