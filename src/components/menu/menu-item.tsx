import {useMenuContext} from '@/components/menu/index';
import {useSubMenuContext} from '@/components/menu/sub-menu';
import {useKey} from '@/tools/key';
import {
  ComponentInternalInstance,
  computed,
  defineComponent,
  getCurrentInstance,
  inject,
  onBeforeUnmount,
  ref
} from 'vue';
import {getComponentFromProp} from '../_util/props-util';
import PropTypes from '../_util/vue-types';
import Tooltip from '../tooltip';

export interface MenuItemInfo {
  key: string | number;
  keyPath: string[] | number[];
  item: ComponentInternalInstance,
  domEvent: Event
}

const itemProps = {
  attribute: PropTypes.object,
  active: PropTypes.bool,
  disabled: PropTypes.bool,
  title: PropTypes.any,
  index: PropTypes.number,
  inlineIndent: PropTypes.number.def(24),
  level: PropTypes.number.def(1),
  parentMenu: PropTypes.object,
  multiple: PropTypes.bool,
  value: PropTypes.any,
  role: PropTypes.any,
  subMenuKey: PropTypes.string,
  itemIcon: PropTypes.any,
  rootPrefixCls: PropTypes.string
  // clearSubMenuTimers: PropTypes.func.def(noop),
};
export default defineComponent({
  name: 'AMenuItem',
  inheritAttrs: false,
  props: itemProps,
  setup(props, {emit}) {
    const subMenuContext = useSubMenuContext();
    const menuContext = useMenuContext();
    const onMenuClick = menuContext.onMenuClick;
    const key = useKey();
    if (subMenuContext) {
      subMenuContext.registerMenu(key);
    }
    const componentInstance = getCurrentInstance();
    const layoutSiderContext = inject('layoutSiderContext');
    const menuItemRef = ref(null);
    const onKeyDown = (e) => {
      menuItemRef.value.onKeyDown(e);
    };
    const setMenuItem = (el) => {
      menuItemRef.value = el;
    };
    const active = ref(props.active);
    const onMouseEnter = (...args: any[]) => {
      if (props.disabled !== true) {
        active.value = true;
        emit('mouseenter', ...args);
        menuContext.setHoverItem(key);
      }
    };
    const onMouseLeave = (...args: any[]) => {
      if (props.disabled !== true) {
        active.value = false;
        emit('mouseleave', ...args);
        menuContext.removeHoverItem(key);
      }
    };
    const isSelected = () => {
      return menuContext.getSelectedKeys().includes(key);
    };
    const onClick = (e) => {
      if (props.disabled) {
        return;
      }
      const info: MenuItemInfo = {
        key,
        keyPath: [key],
        item: componentInstance,
        domEvent: e
      };
      emit('click', info);
      subMenuContext?.onMenuItemClick(info);
      onMenuClick(info);
      if (menuContext.multiple) {
        if (isSelected()) {
          menuContext.deactiveMenu(info);
        } else {
          menuContext.activeMenu(info);
        }
      } else {
        menuContext.activeMenu(info);
      }
    };
    const level = computed(() => subMenuContext ? subMenuContext.level + 1 : props.level);
    const renderItemIcon = () => {
      return getComponentFromProp(componentInstance, 'itemIcon', props)
          || menuContext.itemIcon;
    };
    onBeforeUnmount(() => {
      if (subMenuContext) {
        subMenuContext.unregisterMenu(key);
      }
    });
    return {
      renderItemIcon,
      onMouseEnter,
      level,
      onClick,
      isSelected,
      onMouseLeave,
      active,
      menuContext,
      onKeyDown,
      layoutSiderContext,
      setMenuItem
    };
  },
  render(ctx) {
    const props = this.$props;
    const menuContext = this.menuContext;
    const {getInlineCollapsed, getMode} = menuContext;
    const collapsed = getInlineCollapsed();
    const rootPrefixCls = props.rootPrefixCls || menuContext.rootPrefixCls;
    const {level, title} = this;
    const tooltipProps: any = {
      title: title || (level === 1 ? (this.$slots.default && this.$slots.default()) : '')
    };
    const siderCollapsed = ctx.layoutSiderContext?.collapse;
    if (!siderCollapsed && !collapsed) {
      tooltipProps.title = null;
      // Reset `visible` to fix control mode tooltip display not correct
      // ref: https://github.com/ant-design/ant-design/issues/16742
      tooltipProps.visible = false;
    }
    const toolTipProps = {
      ...tooltipProps,
      placement: 'right',
      overlayClassName: `${rootPrefixCls}-inline-collapsed-tooltip`
    };
    const getPrefixCls = `${rootPrefixCls}-item`;
    const className = {
      [getPrefixCls]: true,
      [`${getPrefixCls}-active`]: !props.disabled && ctx.active,
      [`${getPrefixCls}-selected`]: this.isSelected(),
      [`${getPrefixCls}-disabled`]: props.disabled
    };
    const liProps = {
      ...props.attribute,
      title: props.title,
      role: props.role || 'menuitem',
      'aria-disabled': props.disabled
    };
    if (props.role === 'option') {
      liProps.role = 'option';
      liProps['aria-selected'] = this.isSelected();
    } else if (props.role === null || props.role === 'none') {
      liProps.role = 'none';
    }
    // In case that onClick/onMouseLeave/onMouseEnter is passed down from owner
    Object.assign(liProps, {
      onClick: this.onClick,
      onMouseenter: ctx.onMouseEnter,
      onMouseleave: ctx.onMouseLeave
    });
    const style: any = {};
    if (getMode() === 'inline' && !collapsed) {
      style.paddingLeft = `${props.inlineIndent * level}px`;
    }
    const menuItem = <li ref={ctx.setMenuItem}
                         {...liProps}
                         style={style} class={className}>
      {this.$slots.default && this.$slots.default()}
      {ctx.renderItemIcon()}
    </li>;
    if (collapsed) {
      return <Tooltip {...toolTipProps}>
        {menuItem}
      </Tooltip>;
    }
    return menuItem;
  }
}) as any;
