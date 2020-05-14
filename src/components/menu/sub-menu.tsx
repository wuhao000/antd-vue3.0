import {useAlign} from '@/components/vc-align';
import {noop} from '@/components/vc-menu/util';
import {defineComponent, Transition, vShow, inject, Teleport, ref, computed, withDirectives} from 'vue';
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
  setup(props, {slots, attrs}) {
    const menuPropsContext = inject('menuPropsContext');
    const rootPrefixCls = inject('rootPrefixCls');
    const onKeyDown = (e) => {
      this.$refs.subMenu.onKeyDown(e);
    };
    const visible = ref(false);
    const renderTitle = () => {
      return <div
          onClick={() => {
            visible.value = !visible.value;
          }}
          class={props.prefixCls + '-title'}>
        {slots.title ? slots.title() : props.title}
      </div>;
    };
    const haveRendered = ref(false);
    const popupRef = ref(null);
    const subMenuRef = ref(null);
    useAlign(popupRef, subMenuRef, 'bottomLeft', () => {
      return props.collapse || props.mode === 'horizontal';
    });
    return {
      menuPropsContext,
      onKeyDown,
      rootPrefixCls,
      setSubMenuRef: (el) => {
        subMenuRef.value = el;
      },
      visible,
      setPopupRef: (el) => {
        popupRef.value = el;
      },
      renderTitle
    };
  },
  render(ctx, b) {
    const {rootPrefixCls, prefixCls} = this.$props;
    const {theme: antdMenuTheme} = ctx.menuPropsContext;
    const getActiveClassName = `${prefixCls}-active`;
    const getDisabledClassName = `${prefixCls}-disabled`;
    const getSelectedClassName = `${prefixCls}-selected`;
    const getOpenClassName = `${ctx.rootPrefixCls}-submenu-open`;

    const className = {
      [prefixCls]: true,
      [`${prefixCls}-${ctx.menuPropsContext.mode}`]: true,
      [getOpenClassName]: this.$props.isOpen,
      [getActiveClassName]: this.$props.active || (this.$props.isOpen && this.$props.mode !== 'inline'),
      [getDisabledClassName]: this.$props.disabled
    };
    const style: any = {};
    if (!ctx.visible) {
      style.display = 'none';
    }
    const classes = {
      [prefixCls]: true,
      [rootPrefixCls + '-' + ctx.theme]: true
    };
    const content = (
        <Transition name="slide-up">
          {
            ctx.visible ? <div ref={ctx.setPopupRef}
                               class="ant-menu-submenu ant-menu-light">
              <ul class="ant-menu ant-menu-vertical ant-menu-sub ant-menu-submenu-content">
                {this.$slots.default && this.$slots.default()}
              </ul>
            </div> : null
          }
        </Transition>
    );
    let wrapper = null;
    if (ctx.mode === 'horizontal' || ctx.collapse === true) {
      // @ts-ignore
      wrapper = <Teleport to="body">
        {content}
      </Teleport>;
    } else {
      wrapper = content;
    }
    return (
        <li class={className} ref={ctx.setSubMenuRef}>
          {ctx.renderTitle()}
          {wrapper}
        </li>);
  }
});
