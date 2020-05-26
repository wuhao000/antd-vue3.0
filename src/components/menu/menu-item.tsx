import {useMenuContext} from '@/components/menu/index';
import {useSubMenuContext} from '@/components/menu/sub-menu';
import {useKey} from '@/tools/key';
import {ComponentInternalInstance, computed, defineComponent, getCurrentInstance, inject, ref} from 'vue';
import {getComponentFromProp} from '../_util/props-util';
import PropTypes from '../_util/vue-types';
import Tooltip from '../tooltip';

function noop() {
}

export interface MenuItemInfo {
  key: string | number;
  keyPath: string[] | number[];
  item: ComponentInternalInstance,
  domEvent: Event
}

const itemProps = {
  attribute: PropTypes.object,
  eventKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  active: PropTypes.bool,
  disabled: PropTypes.bool,
  title: PropTypes.any,
  index: PropTypes.number,
  inlineIndent: PropTypes.number.def(24),
  level: PropTypes.number.def(1),
  parentMenu: PropTypes.object,
  multiple: PropTypes.bool,
  value: PropTypes.any,
  manualRef: PropTypes.func.def(noop),
  role: PropTypes.any,
  subMenuKey: PropTypes.string,
  itemIcon: PropTypes.any,
  rootPrefixCls: PropTypes.string
  // clearSubMenuTimers: PropTypes.func.def(noop),
};
export default defineComponent({
  name: 'AMenuItem',
  props: itemProps,
  setup(props, {emit}) {
    const componentInstance = getCurrentInstance();
    const layoutSiderContext = inject('layoutSiderContext');
    const menuItemRef = ref(null);
    const onKeyDown = (e) => {
      menuItemRef.value?.onKeyDown(e);
    };
    const setMenuItem = (el) => {
      menuItemRef.value = el;
    };
    const active = ref(props.active);
    const onMouseEnter = (...args: any[]) => {
      if (props.disabled !== true) {
        active.value = true;
        emit('mouseenter', ...args);
      }
    };
    const onMouseLeave = (...args: any[]) => {
      if (props.disabled !== true) {
        active.value = false;
        emit('mouseleave', ...args);
      }
    };
    const key = useKey();
    const menuContext = useMenuContext();
    const onMenuClick = menuContext.onMenuClick;
    const isSelected = computed(() => {
      return menuContext.getSelectedKeys().includes(key);
    });
    const onClick = (e) => {
      if (props.disabled) {
        return;
      }
      const info: MenuItemInfo = {
        key: props.eventKey,
        keyPath: [props.eventKey],
        item: componentInstance,
        domEvent: e
      };
      emit('click', info);
      onMenuClick(info);

      if (menuContext.multiple) {
        if (isSelected.value) {
          menuContext.deactiveMenu(info);
        } else {
          menuContext.activeMenu(info);
        }
      } else {
        menuContext.activeMenu(info);
      }
      componentInstance.update();
    };
    const subMenuContext = useSubMenuContext();
    const level = computed(() => subMenuContext ? subMenuContext.level + 1 : props.level);
    const renderItemIcon = () => {
      return getComponentFromProp(componentInstance, 'itemIcon', props)
          || menuContext.itemIcon;
    };
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
    const menuContext = useMenuContext();
    const {collapsed, mode} = menuContext;
    const rootPrefixCls = props.rootPrefixCls || menuContext.rootPrefixCls;
    const {level, title} = ctx;
    const tooltipProps: any = {
      title: title || (level.value === 1 ? this.$slots.default : '')
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
      [`${getPrefixCls}-selected`]: ctx.isSelected,
      [`${getPrefixCls}-disabled`]: props.disabled
    };
    const componentInstance = getCurrentInstance();
    const liProps = {
      ...props.attribute,
      title: props.title,
      role: props.role || 'menuitem',
      'aria-disabled': props.disabled
    };
    if (props.role === 'option') {
      liProps.role = 'option';
      liProps['aria-selected'] = ctx.isSelected;
    } else if (props.role === null || props.role === 'none') {
      liProps.role = 'none';
    }
    // In case that onClick/onMouseLeave/onMouseEnter is passed down from owner
    Object.assign(liProps, {
      onClick: ctx.onClick,
      onMouseenter: ctx.onMouseEnter,
      onMouseleave: ctx.onMouseLeave
    });
    const style: any = {};
    if (mode === 'inline') {
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
