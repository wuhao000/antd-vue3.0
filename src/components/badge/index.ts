import Badge from './badge';
import Base from '../base';

/* istanbul ignore next */
Badge.install = function(Vue) {
  Vue.use(Base);
  Vue.component(Badge.name, Badge);
};

export default Badge;
