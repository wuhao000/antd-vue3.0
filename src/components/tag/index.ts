import Tag from './tag';
import CheckableTag from './checkable-tag';
import Base from '../base';

Tag.CheckableTag = CheckableTag;

/* istanbul ignore next */
Tag.install = function(Vue) {
  Vue.use(Base);
  Vue.component(Tag.name, Tag);
  Vue.component(Tag.CheckableTag.name, Tag.CheckableTag);
};

export default Tag;
