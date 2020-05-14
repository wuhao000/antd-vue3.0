import {useMenuContext} from '@/components/menu/index';
import PropTypes from '../_util/vue-types';
import { getComponentFromProp, getListeners } from '../_util/props-util';
import { getCurrentInstance, defineComponent } from 'vue';

// import { menuAllProps } from './util'

const MenuItemGroup = defineComponent({
  name: 'AMenuItemGroup',
  props: {
    renderMenuItem: PropTypes.func,
    index: PropTypes.number,
    className: PropTypes.string,
    subMenuKey: PropTypes.string,
    rootPrefixCls: PropTypes.string,
    disabled: PropTypes.bool.def(true),
    title: PropTypes.any,
  },
  setup() {
    const {rootPrefixCls} = useMenuContext()
    return {rootPrefixCls}
  },
  render(ctx) {
    const { rootPrefixCls, title } = ctx;
    const componentInstance = getCurrentInstance();
    const titleClassName = `${rootPrefixCls}-item-group-title`;
    const listClassName = `${rootPrefixCls}-item-group-list`;
    // menuAllProps.props.forEach(key => delete props[key])
    const listeners = { ...getListeners(this) };
    delete listeners.click;

    return (
      <li {...{ on: listeners, class: `${rootPrefixCls}-item-group` }}>
        <div class={titleClassName} title={typeof title === 'string' ? title : undefined}>
          {getComponentFromProp(componentInstance, 'title')}
        </div>
        <ul class={listClassName}>
          {this.$slots.default && this.$slots.default()}
        </ul>
      </li>
    );
  },
});

export default MenuItemGroup;
