import {useMenuContext} from '@/components/menu/index';
import {ProvideKeys} from '@/components/menu/utils';
import {useAlign} from '@/components/vc-align';
import {noop} from '@/components/vc-menu/util';
import {computed, defineComponent, inject, provide, ref, Teleport, Transition, getCurrentInstance} from 'vue';
import PropTypes from '../_util/vue-types';

export interface SubMenuContext {
  level: number;
}

export const useSubMenuContext = () => inject(ProvideKeys.SubMenuContext) as SubMenuContext;

export default defineComponent({
  name: 'ASubMenu',
  props: {
    title: PropTypes.any,
    prefixCls: PropTypes.string.def('ant-menu-submenu'),
    openKeys: PropTypes.array.def([]),
    openChange: PropTypes.func.def(noop),
    eventKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    multiple: PropTypes.bool,
    active: PropTypes.bool, // TODO: remove
    index: PropTypes.number,
    popupClassName: PropTypes.string,
    disabled: PropTypes.bool,
    subMenuOpenDelay: PropTypes.number.def(0.1),
    subMenuCloseDelay: PropTypes.number.def(0.1),
    level: PropTypes.number.def(1),
    openTransitionName: PropTypes.string,
    popupOffset: PropTypes.array,
    manualRef: PropTypes.func.def(noop),
    builtinPlacements: PropTypes.object.def(() => ({})),
    itemIcon: PropTypes.any,
    expandIcon: PropTypes.any
  },
  setup(props, {slots}) {
    const {mode, collapsed, rootPrefixCls, inlineIndent} = useMenuContext();
    const isInlineMode = computed(() => mode === 'inline');
    const visible = ref(false);
    const subMenuContext = useSubMenuContext();
    const level = computed(() => {
      if (subMenuContext) {
        return subMenuContext.level + props.level;
      } else {
        return props.level;
      }
    });
    const renderTitle = () => {
      const style: any = {};
      if (isInlineMode) {
        style.paddingLeft = `${inlineIndent * level.value}px`;
      }
      return <div
        onClick={() => {
          visible.value = !visible.value;
        }}
        style={style}
        class={props.prefixCls + '-title'}>
        {slots.title ? slots.title() : props.title}
        <i class="ant-menu-submenu-arrow"/>
      </div>;
    };
    const popupRef = ref(null);
    const subMenuRef = ref(null);
    useAlign(popupRef, subMenuRef, 'bottomLeft', () => {
      return collapsed || mode === 'horizontal';
    });
    if (!subMenuContext) {
      provide(ProvideKeys.SubMenuContext, {
        level: props.level
      } as SubMenuContext);
    } else {
      provide(ProvideKeys.SubMenuContext, {
        level: subMenuContext.level + 1
      } as SubMenuContext);
    }
    return {
      rootPrefixCls,
      setSubMenuRef: (el) => {
        subMenuRef.value = el;
      },
      collapsed,
      visible,
      mode,
      setPopupRef: (el) => {
        popupRef.value = el;
      },
      renderTitle
    };
  },
  render(ctx) {
    const {rootPrefixCls, prefixCls} = ctx;
    const className = {
      [prefixCls]: true


    };
    const style: any = {};
    if (!ctx.visible) {
      style.display = 'none';
    }
    const classes = {
      [prefixCls]: true,
      [`${prefixCls}-active`]: this.$props.active || (ctx.visible && ctx.mode !== 'inline'),
      [`${prefixCls}-disabled`]: this.$props.disabled,
      // [`${prefixCls}-selected`]: isSelected,
      [`${prefixCls}-popup`]: ctx.collapse || ctx.mode !== 'inline',
      [`${prefixCls}-open`]: ctx.visible,
      [`${prefixCls}-${ctx.mode}`]: true
    };
    const menuClass = {
      [rootPrefixCls]: true,
      [rootPrefixCls + '-' + ctx.mode]: true,
      [rootPrefixCls + '-sub']: true,
      [prefixCls + '-content']: ctx.mode !== 'inline'
    };
    const menu = <ul class={menuClass}>
      {this.$slots.default && this.$slots.default()}
    </ul>;
    let innerContent = null;
    if (ctx.mode !== 'inline' || ctx.collapsed) {
      innerContent = <div ref={ctx.setPopupRef}
                          class={[prefixCls]}>
        {menu}
      </div>;
    } else {
      innerContent = menu;
    }
    const content = (
      <Transition name="slide-up">
        {ctx.visible ? innerContent : null}
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
      <li class={classes} ref={ctx.setSubMenuRef}>
        {ctx.renderTitle()}
        {wrapper}
      </li>);
  }
});
