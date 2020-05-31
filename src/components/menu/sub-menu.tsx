import {useMenuContext} from '@/components/menu/index';
import {MenuItemInfo} from '@/components/menu/menu-item';
import {ProvideKeys} from '@/components/menu/utils';
import {useRefs} from '@/components/vc-tabs/src/save-ref';
import {
  computed,
  defineComponent,
  getCurrentInstance,
  inject,
  nextTick,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  provide,
  reactive,
  ref,
  Transition
} from 'vue';
import getTransitionProps from '../_util/get-transition-props';
import {cancelAnimationTimeout, requestAnimationTimeout} from '../_util/request-animation-timeout';
import PropTypes from '../_util/vue-types';
import Trigger from '../vc-trigger';
import {placements} from './placements';

const popupPlacementMap = {
  horizontal: 'bottomLeft',
  vertical: 'rightTop',
  'vertical-left': 'rightTop',
  'vertical-right': 'leftTop'
};

export function noop() {
}

export interface SubMenuContext {
  level: number;
  registerMenu: (key: string) => void;
  onMenuItemClick: (info: MenuItemInfo) => void;
  unregisterMenu: (key: string) => void;
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
    builtinPlacements: PropTypes.object.def(() => ({})),
    itemIcon: PropTypes.any,
    expandIcon: PropTypes.any
  },
  setup(props, {emit, slots}) {
    const {mode, getSelectedKeys, openAnimation, openTransitionName, triggerSubMenuAction, theme, collapsed, rootPrefixCls, inlineIndent} = useMenuContext();
    const isInlineMode = computed(() => mode === 'inline');
    const visible = ref(false);
    const {saveRef, getRef} = useRefs();
    const menuInstance = ref(undefined);
    const haveRendered = ref(false);
    const subMenuContext = useSubMenuContext();
    const getLevel = () => {
      if (subMenuContext) {
        return subMenuContext.level + props.level;
      } else {
        return props.level;
      }
    };
    const renderTitle = () => {
      const style: any = {};
      if (isInlineMode && !collapsed) {
        style.paddingLeft = `${inlineIndent * getLevel()}px`;
      }
      return (
          <div
              onClick={() => {
                visible.value = !visible.value;
              }}
              ref={saveRef('subMenuTitle')}
              style={style}
              class={props.prefixCls + '-title'}>
            {slots.title ? slots.title() : props.title}
            <i class="ant-menu-submenu-arrow"/>
          </div>
      );
    };
    const onPopupVisibleChange = (v) => {
      visible.value = v;
    };
    const popupRef = ref(null);
    const subMenuRef = ref(null);
    const menuItemKeys = reactive([]);
    const onMenuItemClick = (info) => {
      emit('click', {
        ...info,
        keyPath: (info.keyPath || []).concat(props.eventKey)
      });
      if (mode === 'horizontal' || collapsed) {
        visible.value = false;
      }
      subMenuContext?.onMenuItemClick(info);
    };
    const subMenuContextValue = reactive<SubMenuContext>({
      level: props.level,
      registerMenu: (key) => {
        if (!menuItemKeys.includes(key)) {
          menuItemKeys.push(key);
        }
        subMenuContext?.registerMenu(key);
      },
      onMenuItemClick,
      unregisterMenu: (key) => {
        if (menuItemKeys.includes(key)) {
          menuItemKeys.splice(menuItemKeys.indexOf(key), 1);
        }
        subMenuContext?.unregisterMenu(key);
      }
    });
    if (subMenuContext) {
      subMenuContextValue.level = subMenuContext.level + 1;
    }
    const adjustWidth = () => {
      const subMenuTitle = getRef('subMenuTitle');
      /* istanbul ignore if */
      if (!subMenuTitle || !menuInstance.value) {
        return;
      }
      const popupMenu = menuInstance.value;
      if (popupMenu.offsetWidth >= subMenuTitle.offsetWidth) {
        return;
      }
      /* istanbul ignore next */
      popupMenu.style.minWidth = `${subMenuTitle.offsetWidth}px`;
    };
    const minWidthTimeout = ref(undefined);
    const instance = getCurrentInstance();
    const handleUpdated = () => {
      const parentMenu = instance.parent;
      if (mode !== 'horizontal' || !parentMenu['ctx'].isRootMenu || !visible.value) {
        return;
      }
      minWidthTimeout.value = requestAnimationTimeout(() => adjustWidth(), 0);
    };
    const isSelected = () => {
      const selectedKeys = getSelectedKeys();
      return menuItemKeys.some(it => selectedKeys.includes(it));
    };
    onBeforeUnmount(() => {
      if (minWidthTimeout.value) {
        cancelAnimationTimeout(minWidthTimeout.value);
        minWidthTimeout.value = null;
      }
    });
    onMounted(() => {
      haveRendered.value = true;
      nextTick(() => {
        handleUpdated();
      });
    });
    onUpdated(() => {
      nextTick(() => {
        handleUpdated();
      });
    });
    provide(ProvideKeys.SubMenuContext, subMenuContextValue as SubMenuContext);
    return {
      rootPrefixCls,
      collapsed,
      visible,
      mode,
      theme,
      isSelected,
      openTransitionName,
      triggerSubMenuAction,
      renderTitle,
      haveRendered,
      onPopupVisibleChange,
      openAnimation,
      setSubMenuRef: (el) => {
        subMenuRef.value = el;
      },
      setPopupRef: (el) => {
        popupRef.value = el;
      },
      setMenuContent: (el) => {
        menuInstance.value = el;
      }
    };
  },
  render() {
    const {rootPrefixCls, collapsed, visible, mode, theme, prefixCls} = this;
    const style: any = {};
    if (!visible) {
      style.display = 'none';
    }
    const classes = {
      [prefixCls]: true,
      [`${prefixCls}-active`]: this.$props.active || (visible && mode !== 'inline'),
      [`${prefixCls}-disabled`]: this.$props.disabled,
      [`${prefixCls}-selected`]: this.isSelected(),
      [`${prefixCls}-open`]: visible,
      [`${prefixCls}-${mode}`]: true
    };
    const menuClass = {
      [rootPrefixCls]: true,
      [rootPrefixCls + '-inline']: mode === 'inline',
      [rootPrefixCls + '-vertical']: mode === 'horizontal' || mode === 'vertical',
      [rootPrefixCls + '-sub']: true,
      [prefixCls + '-content']: mode !== 'inline'
    };
    const menu = (
        <ul class={menuClass} ref={this.setMenuContent}>
          {this.$slots.default && this.$slots.default()}
        </ul>
    );
    let innerContent = null;
    if (mode !== 'inline' || collapsed) {
      innerContent = <div ref={this.setPopupRef}
                          class={[prefixCls]}>
        {menu}
      </div>;
    } else {
      innerContent = menu;
    }
    const popupPlacement = popupPlacementMap[collapsed ? 'vertical-left' : this.mode];
    const popupAlign = this.popupOffset ? {offset: this.popupOffset} : {};
    let wrapper = null;
    let renderTitle = true;
    if (mode === 'horizontal' || collapsed) {
      renderTitle = false;
      wrapper = <Trigger
          prefixCls={prefixCls}
          popupTransitionName={'slide-up'}
          popupClassName={`${prefixCls}-popup ${rootPrefixCls}-${
              theme
          } ${this.popupClassName || ''}`}
          builtinPlacements={Object.assign({}, placements, this.builtinPlacements)}
          popupPlacement={popupPlacement}
          popupVisible={this.visible}
          popupAlign={popupAlign}
          action={this.disabled ? [] : [this.triggerSubMenuAction]}
          mouseEnterDelay={this.subMenuOpenDelay}
          mouseLeaveDelay={this.subMenuCloseDelay}
          onPopupVisibleChange={this.onPopupVisibleChange}>
        <template slot="popup">{innerContent}</template>
        {this.renderTitle()}
      </Trigger>;
    } else {
      const transitionAppear = this.haveRendered || !this.visible || this.mode !== 'inline';
      let animProps = {appear: transitionAppear, css: false};
      let transitionProps = {
        ...animProps
      };
      if (this.openTransitionName) {
        transitionProps = getTransitionProps(this.openTransitionName, {
          appear: transitionAppear
        });
      } else if (typeof this.openAnimation === 'object') {
        animProps = {...animProps, ...this.openAnimation};
        if (!transitionAppear) {
          animProps.appear = false;
        }
      } else if (typeof this.openAnimation === 'string') {
        transitionProps = getTransitionProps(this.openAnimation, {appear: transitionAppear});
      }
      wrapper = (
          <Transition {...transitionProps}>
            {this.visible ? innerContent : null}
          </Transition>
      );
    }
    return (
        <li class={classes} ref={this.setSubMenuRef}>
          {renderTitle ? this.renderTitle() : null}
          {wrapper}
        </li>);
  }
});
