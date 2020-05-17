import {useMenuContext} from '@/components/menu/index';
import PropTypes from '../_util/vue-types';
import { getComponentFromProp, getListeners } from '../_util/props-util';
import { getCurrentInstance, defineComponent, inject } from 'vue';

// import { menuAllProps } from './util'

const MenuItemGroup = defineComponent({
  name: 'AMenuItemGroup',
  props: {
    index: PropTypes.number,
    subMenuKey: PropTypes.string,
    disabled: PropTypes.bool.def(true),
    title: PropTypes.any
  },
  setup() {
    return {};
  },
  render() {
    const props = {...this.$props};
    const {title} = props;
    const {rootPrefixCls} = useMenuContext();
    const componentInstance = getCurrentInstance();
    const titleClassName = `${rootPrefixCls}-item-group-title`;
    const listClassName = `${rootPrefixCls}-item-group-list`;
    // menuAllProps.props.forEach(key => delete props[key])
    const listeners = {...getListeners(this)};
    delete listeners.click;

    return (
        <li class={`${rootPrefixCls}-item-group`} {...listeners}>
          <div class={titleClassName} title={typeof title === 'string' ? title : undefined}>
            {getComponentFromProp(componentInstance, 'title')}
          </div>
          <ul class={listClassName}>
            {this.$slots.default && this.$slots.default()}
          </ul>
        </li>
    );
  }
}) as any;

export default MenuItemGroup;
