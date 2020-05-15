import {useMenuContext} from '@/components/menu/index';
import {useSubMenuContext} from '@/components/menu/sub-menu';
import {useKey} from '@/tools/key';
import {computed, defineComponent, getCurrentInstance, inject, ref} from 'vue';
import {getComponentFromProp} from '../_util/props-util';
import PropTypes from '../_util/vue-types';
import Tooltip from '../tooltip';

function noop() {
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
  itemIcon: PropTypes.any
  // clearSubMenuTimers: PropTypes.func.def(noop),
};
export default defineComponent({
  name: 'AMenuItem',
  props: itemProps,
  setup(props, {emit}) {
    const layoutSiderContext = inject('layoutSiderContext');
    const menuItemRef = ref(null);
    const onKeyDown = (e) => {
      menuItemRef.value?.onKeyDown(e);
    };
    const setMenuItem = (el) => {
      menuItemRef.value = el;
    };
    const active = ref(false);
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
    const {selectedKeys} = useMenuContext();
    const isSelected = computed(() => selectedKeys.value.includes(key));
    const subMenuContext = useSubMenuContext();
    const level = computed(() => subMenuContext ? subMenuContext.level + 1 : props.level);
    return {onMouseEnter, level, isSelected, onMouseLeave, active, onKeyDown, layoutSiderContext, setMenuItem};
  },
  render(ctx) {
    const props = this.$props;
    const {activeMenu, collapsed, mode, rootPrefixCls} = useMenuContext();
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
    let liProps = {
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
    const key = useKey();
    // In case that onClick/onMouseLeave/onMouseEnter is passed down from owner
    Object.assign(liProps, {
      onClick: props.disabled ? noop : (...args: any[]) => {
        this.$emit('click', ...args);
        activeMenu(key);
      },
      onMouseenter: ctx.onMouseEnter,
      onMouseleave: ctx.onMouseLeave
    });

    const style: any = {};
    if (mode === 'inline') {
      style.paddingLeft = `${props.inlineIndent * level}px`;
    }
    const componentInstance = getCurrentInstance();
    const menuItem = <li ref={ctx.setMenuItem} {...liProps} style={style} class={className}>
      {this.$slots.default && this.$slots.default()}
      {getComponentFromProp(componentInstance, 'itemIcon', props)}
    </li>;
    if (collapsed) {
      return <Tooltip {...toolTipProps}>
        {menuItem}
      </Tooltip>;
    }
    return menuItem;
  }
});
