import {useMenuContext} from '@/components/menu/index';
import placements from '@/components/vc-menu/placements';
import {noop} from '@/components/vc-menu/util';
import {useMouseEvent} from '@/tools/mouse';
import {defineComponent, inject, ref, Teleport, Transition} from 'vue';
import PropTypes from '../_util/vue-types';
import VcAlign from '../vc-align';

export default defineComponent({
  name: 'ASubMenu',
  props: {
    parentMenu: PropTypes.object,
    title: PropTypes.any,
    prefixCls: PropTypes.string.def('ant-menu-submenu'),
    openKeys: PropTypes.array.def([]),
    openChange: PropTypes.func.def(noop),
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
    manualRef: PropTypes.func.def(noop),
    builtinPlacements: PropTypes.object.def(() => ({})),
    itemIcon: PropTypes.any,
    expandIcon: PropTypes.any
  },
  setup(props, {slots}) {
    const menuPropsContext = inject('menuPropsContext');
    const rootPrefixCls = inject('rootPrefixCls');
    const onKeyDown = (e) => {
      rootRef.value.onKeyDown(e);
    };
    const setRoot = (el) => {
      rootRef.value = el;
    };
    const renderTitle = () => {
      return <div class={props.prefixCls + '-title'}>
        {slots.title ? slots.title() : props.title}
      </div>;
    };
    const visible = ref(false);
    const rootRef = ref(null);
    const wrapperRef = ref(null);
    // onMounted(() => {
    //   useAlign(wrapperRef, rootRef, placements['bottomLeft']);
    // });
    const {onMouseEnter, onMouseLeave} = useMouseEvent();
    onMouseEnter.value = (e) => {
      onVisibleChange(true);
    };
    onMouseLeave.value = (e) => {
      onVisibleChange(false);
    };
    const deplayTimer = ref(null);
    const tempVisible = ref(false);
    const onVisibleChange = (visibleState: boolean) => {
      tempVisible.value = visibleState;
      if (deplayTimer.value) {
        clearTimeout(deplayTimer.value);
      }
      deplayTimer.value = setTimeout(() => {
        if (visible.value !== tempVisible.value) {
          visible.value = tempVisible.value;
        }
      }, 100);
    };
    const {theme, mode} = useMenuContext();
    return {
      theme, mode,
      menuPropsContext,
      setWrapperRef: (el, b) => {
        wrapperRef.value = el;
      },
      setRoot,
      onKeyDown, rootPrefixCls, renderTitle, visible,
      rootRef,
      onVisibleChange
    };
  },
  render(ctx) {
    const {rootPrefixCls, prefixCls} = ctx;
    const {theme: antdMenuTheme} = ctx.menuPropsContext;
    const getActiveClassName = `${prefixCls}-active`;
    const getDisabledClassName = `${prefixCls}-disabled`;
    const getSelectedClassName = `${prefixCls}-selected`;
    const getOpenClassName = `${ctx.rootPrefixCls}-submenu-open`;
    const className = {
      [prefixCls]: true,
      [`${prefixCls}-${ctx.menuPropsContext.mode}`]: true,
      [prefixCls + '-popup']: ctx.collapse || ctx.mode === 'horizontal',
      [getOpenClassName]: this.$props.isOpen,
      [getActiveClassName]: this.$props.active || (ctx.visible && ctx.mode !== 'inline'),
      [getDisabledClassName]: this.$props.disabled
    };
    const childrenWrapperClass = {
      [prefixCls]: true,
      [prefixCls + '-popup']: ctx.collapse || ctx.mode === 'horizontal',
      ['ant-menu-' + ctx.theme]: true,
      [prefixCls + '-placement-bottomLeft']: true
    };
    const wrapperStyle: any = {};
    if (!ctx.visible) {
      wrapperStyle.display = 'none';
    }
    const menuClasses = [
      rootPrefixCls, rootPrefixCls + '-vertical',
      prefixCls, rootPrefixCls + '-submenu-content'
    ];
    return (
      <li class={className} ref={ctx.setRoot}>
        {ctx.renderTitle()}
        {
          // @ts-ignore
          <Teleport to="body" disabled={ctx.disabled}>
            <VcAlign target={ctx.rootRef} align={placements['bottomLeft']}>
              <Transition name="slide-up">
                {
                  ctx.visible ? <div
                    onMouseenter={() => {
                      ctx.onVisibleChange(true);
                    }}
                    onMouseleave={() => {
                      ctx.onVisibleChange(false);
                    }}
                    ref={ctx.setWrapperRef} class={childrenWrapperClass}>
                    <ul class={menuClasses}>
                      {this.$slots.default()}
                    </ul>
                  </div> : null
                }
              </Transition>
            </VcAlign>
          </Teleport>
        }
      </li>);
  }
});
