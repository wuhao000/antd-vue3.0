import Breadcrumb from './breadcrumb';
import BreadcrumbItem from './breadcrumb-item';
import BreadcrumbSeparator from './breadcrumb-separator';
import Base from '../base';

Breadcrumb.Item = BreadcrumbItem;
Breadcrumb.Separator = BreadcrumbSeparator;

/* istanbul ignore next */
Breadcrumb.install = function(Vue) {
  Vue.use(Base);
  Vue.component(Breadcrumb.name, Breadcrumb);
  Vue.component(BreadcrumbItem.name, BreadcrumbItem);
  Vue.component(BreadcrumbSeparator.name, BreadcrumbSeparator);
};

export default Breadcrumb;
