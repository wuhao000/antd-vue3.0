import {useMenuContext} from '@/components/menu/index';
import {useKey} from '@/tools/key';
import {defineComponent, getCurrentInstance, inject, ref, watch} from 'vue';
import {getComponentFromProp, getListeners} from '../_util/props-util';
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
  isSelected: PropTypes.bool,
  manualRef: PropTypes.func.def(noop),
  role: PropTypes.any,
  subMenuKey: PropTypes.string,
  itemIcon: PropTypes.any
  // clearSubMenuTimers: PropTypes.func.def(noop),
};
export default defineComponent({
  name: 'AMenuItem',
  props: itemProps,
  setup(props, {attrs}) {
    const {selectedKeys} = useMenuContext();
    const rootPrefixCls: string = inject('rootPrefixCls') || 'ant-menu';
    const getInlineCollapsed: () => any = inject('getInlineCollapsed') || noop;
    const layoutSiderContext: any = inject('layoutSiderContext') || {};
    const menuItemRef = ref(null);
    const onKeyDown = (e) => {
      menuItemRef.value?.onKeyDown(e);
    };
    const setMenuItem = (el) => {
      menuItemRef.value = el;
    };
    const selected = ref(false);
    const key = useKey()
    watch(() => selectedKeys.value, (value) => {
      if (value.includes(key)) {
        selected.value = true;
      }
    }, {immediate: true});
    return {getInlineCollapsed, selected, rootPrefixCls, onKeyDown, layoutSiderContext, setMenuItem};
  },
  render(ctx) {
    const menuContext = useMenuContext();
    const props = this.$props;
    const {rootPrefixCls} = ctx;
    const {level, title} = props;
    const {getInlineCollapsed, $slots, $attrs: attrs} = this;
    const inlineCollapsed = getInlineCollapsed();
    const tooltipProps: any = {
      title: title || (level === 1 ? $slots.default : '')
    };
    const siderCollapsed = this.layoutSiderContext.sCollapsed;
    if (!siderCollapsed && !inlineCollapsed) {
      tooltipProps.title = null;
      // Reset `visible` to fix control mode tooltip display not correct
      // ref: https://github.com/ant-design/ant-design/issues/16742
      tooltipProps.visible = false;
    }

    const itemProps = {
      props: {
        ...props,
        title
      },
      attrs,
      on: getListeners(this)
    };
    const toolTipProps = {
      props: {
        ...tooltipProps,
        placement: 'right',
        overlayClassName: `${rootPrefixCls}-inline-collapsed-tooltip`
      }
    };
    const getPrefixCls = `${rootPrefixCls}-item`;
    const getActiveClassName = `${getPrefixCls}-active`;
    const getSelectedClassName = `${getPrefixCls}-selected`;
    const getDisabledClassName = `${getPrefixCls}-disabled`;
    const className = {
      [getPrefixCls]: true,
      [getActiveClassName]: !props.disabled && props.active,
      [getSelectedClassName]: ctx.selected,
      [getDisabledClassName]: props.disabled
    };
    let liProps = {
      ...props.attribute,
      class: className,
      title: props.title,
      role: props.role || 'menuitem',
      ref: ctx.setMenuItem,
      'aria-disabled': props.disabled
    };
    if (props.role === 'option') {
      liProps.role = 'option';
      liProps['aria-selected'] = props.isSelected;
    } else if (props.role === null || props.role === 'none') {
      liProps.role = 'none';
    }
    const key = useKey();
    // In case that onClick/onMouseLeave/onMouseEnter is passed down from owner
    Object.assign(liProps, {
      onClick: props.disabled ? noop : (...args: any[]) => {
        this.$emit('click', ...args);
        menuContext.activeMenu(key)
      },
      onMouseleave: props.disabled ? noop : (...args: any[]) => {
        this.$emit('mouseleave', ...args);
      },
      onMouseenter: props.disabled ? noop : (...args: any) => {
        this.$emit('mouseenter', ...args);
      }
    });
    const style: any = {};
    if (props.mode === 'inline') {
      style.paddingLeft = `${props.inlineIndent * props.level}px`;
    }
    liProps.style = style;
    const componentInstance = getCurrentInstance();
    console.log(liProps);
    return <Tooltip {...toolTipProps}>
      <li {...liProps} >
        {this.$slots.default && this.$slots.default()}
        {getComponentFromProp(componentInstance, 'itemIcon', props)}
      </li>
    </Tooltip>;
  }
});
