import {noop} from '@/components/vc-menu/util';
import {defineComponent, inject, Teleport} from 'vue';
import PropTypes from '../_util/vue-types';

export default defineComponent({
  name: 'ASubMenu',
  props: {
    parentMenu: PropTypes.object,
    title: PropTypes.any,
    selectedKeys: PropTypes.array.def([]),
    prefixCls: PropTypes.string.def('ant-menu-submenu'),
    openKeys: PropTypes.array.def([]),
    openChange: PropTypes.func.def(noop),
    rootPrefixCls: PropTypes.string,
    eventKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    multiple: PropTypes.bool,
    active: PropTypes.bool, // TODO: remove
    isRootMenu: PropTypes.bool.def(false),
    index: PropTypes.number,
    triggerSubMenuAction: PropTypes.string,
    popupClassName: PropTypes.string,
    getPopupContainer: PropTypes.func,
    forceSubMenuRender: PropTypes.bool,
    openAnimation: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    disabled: PropTypes.bool,
    subMenuOpenDelay: PropTypes.number.def(0.1),
    subMenuCloseDelay: PropTypes.number.def(0.1),
    level: PropTypes.number.def(1),
    inlineIndent: PropTypes.number.def(24),
    openTransitionName: PropTypes.string,
    popupOffset: PropTypes.array,
    isOpen: PropTypes.bool,
    store: PropTypes.object,
    mode: PropTypes.oneOf([
      'horizontal',
      'vertical',
      'vertical-left',
      'vertical-right',
      'inline'
    ]).def('vertical'),
    manualRef: PropTypes.func.def(noop),
    builtinPlacements: PropTypes.object.def(() => ({})),
    itemIcon: PropTypes.any,
    expandIcon: PropTypes.any
  },
  setup(props, {slots}) {
    const menuPropsContext = inject('menuPropsContext');
    const rootPrefixCls = inject('rootPrefixCls');
    const onKeyDown = (e) => {
      this.$refs.subMenu.onKeyDown(e);
    };
    const renderTitle = () => {
      return <div class={props.prefixCls+'-title'}>
        {slots.title ? slots.title() : props.title}
      </div>
    }
    return {menuPropsContext, onKeyDown, rootPrefixCls, renderTitle};
  },
  render(ctx) {
    const {rootPrefixCls, prefixCls} = this.$props;
    const {theme: antdMenuTheme} = ctx.menuPropsContext;
    const getActiveClassName = `${prefixCls}-active`;
    const getDisabledClassName =  `${prefixCls}-disabled`;
    const getSelectedClassName = `${prefixCls}-selected`;
    const getOpenClassName =  `${ctx.rootPrefixCls}-submenu-open`;

    const className = {
      [prefixCls]: true,
      [`${prefixCls}-${ctx.menuPropsContext.mode}`]: true,
      [getOpenClassName]: this.$props.isOpen,
      [getActiveClassName]: this.$props.active || (this.$props.isOpen && this.$props.mode !== 'inline'),
      [getDisabledClassName]: this.$props.disabled
    };
    return (
        <li class={className}>
          {ctx.renderTitle()}
          <Teleport to="body">
            {this.$slots.default()}
          </Teleport>
        </li>);
  }
});
