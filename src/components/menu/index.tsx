import {ProvideKeys} from '@/components/menu/utils';
import select from '@/components/vc-select/select';
import omit from 'omit.js';
import {defineComponent, h, inject, onUpdated, provide, reactive, Ref, ref, watch, VNode} from 'vue';
import animation from '../_util/openAnimation';
import PropTypes from '../_util/vue-types';
import Base from '../base';
import {ConfigConsumerProps} from '../config-provider';
import Divider from './divider';
import Item, {MenuItemInfo} from './menu-item';
import ItemGroup from './menu-item-group';
import commonPropsType from './menu-props';
import './style';
import SubMenu from './sub-menu';


// import raf from '../_util/raf';


export interface IMenuContext {
  itemIcon?: VNode | string;
  multiple: boolean;
  getSelectedKeys: () => string[];
  mode: string;
  theme: 'light' | 'dark';
  rootPrefixCls: string;
  collapsed: boolean;
  inlineIndent: number;
  activeMenu: (info: MenuItemInfo) => never;
  deactiveMenu: (info: MenuItemInfo) => never;
  onMenuClick: (info) => any;
}


export const useMenuContext: () => IMenuContext = () => {
  return inject(ProvideKeys.MenuContext) as IMenuContext || {
    multiple: false,
    getSelectedKeys: () => [],
    rootPrefixCls: 'ant-menu',
    itemIcon: null,
    activeMenu: (info) => {
    },
    deactiveMenu: (info) => {
    },
    collapsed: false,
    mode: 'inline',
    inlineIndent: 24,
    onMenuClick: (info) => {
    },
    theme: 'light',
  } as IMenuContext;
};

export const MenuMode = PropTypes.oneOf([
  'vertical',
  'vertical-left',
  'vertical-right',
  'horizontal',
  'inline'
]);

export const menuProps = {
  ...commonPropsType,
  theme: PropTypes.oneOf(['light', 'dark']).def('light'),
  mode: MenuMode.def('vertical'),
  selectable: PropTypes.bool.def(true),
  selectedKeys: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
  defaultSelectedKeys: PropTypes.array,
  openKeys: PropTypes.array,
  defaultOpenKeys: PropTypes.array,
  openAnimation: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  openTransitionName: PropTypes.string,
  multiple: PropTypes.bool,
  inlineIndent: PropTypes.number.def(24),
  inlineCollapsed: PropTypes.bool,
  isRootMenu: PropTypes.bool.def(true),
  focusable: PropTypes.bool.def(false)
};

const Menu = defineComponent({
  name: 'AMenu',
  props: menuProps,
  setup(props, {emit}) {
    const layoutSiderContext: any = inject('layoutSiderContext') || {};
    const getInlineCollapsed = () => {
      const {inlineCollapsed} = props;
      if (layoutSiderContext.sCollapsed !== undefined) {
        return layoutSiderContext.sCollapsed;
      }
      return inlineCollapsed;
    };
    const propsUpdating = ref(false);
    onUpdated(() => {
      propsUpdating.value = false;
    });
    const switchingModeFromInline = ref(false);
    watch(() => props.mode, (val: string, oldVal: string) => {
      if (oldVal === 'inline' && val !== 'inline') {
        switchingModeFromInline.value = true;
      }
    });
    const openKeys = ref([] as string[]);
    if (props.openKeys) {
      openKeys.value = props.openKeys;
    } else if (props.defaultOpenKeys) {
      openKeys.value = props.defaultOpenKeys;
    }
    const inlineOpenKeys = ref([] as string[]);
    watch(() => props.openKeys, (val: string[]) => {
      openKeys.value = val;
    });
    const collapsedChange = (val) => {
      if (propsUpdating.value) {
        return;
      }
      propsUpdating.value = true;
      if (props.openKeys === undefined) {
        if (val) {
          switchingModeFromInline.value = true;
          inlineOpenKeys.value = openKeys.value;
          openKeys.value = [];
        } else {
          openKeys.value = inlineOpenKeys.value;
          inlineOpenKeys.value = [];
        }
      } else if (val) {
        // 缩起时，openKeys置为空的动画会闪动，react可以通过是否传递openKeys避免闪动，vue不是很方便动态传递openKeys
        switchingModeFromInline.value = true;
      }
    };
    const restoreModeVerticalFromInline = () => {
      if (switchingModeFromInline.value) {
        switchingModeFromInline.value = false;
      }
    };
    const handleMouseEnter = (e) => {
      restoreModeVerticalFromInline();
      emit('mouseenter', e);
    };
    watch(() => props.inlineCollapsed, val => {
      collapsedChange(val);
    });
    watch(() => layoutSiderContext.sCollapsed, (val) => {
      collapsedChange(val);
    });
    const handleTransitionEnd = (e) => {
      // when inlineCollapsed menu width animation finished
      // https://github.com/ant-design/ant-design/issues/12864
      const widthCollapsed = e.propertyName === 'width' && e.target === e.currentTarget;

      // Fix SVGElement e.target.className.indexOf is not a function
      // https://github.com/ant-design/ant-design/issues/15699
      const {className} = e.target;
      // SVGAnimatedString.animVal should be identical to SVGAnimatedString.baseVal, unless during an animation.
      const classNameValue =
        Object.prototype.toString.call(className) === '[object SVGAnimatedString]'
          ? className.animVal
          : className;

      // Fix for <Menu style={{ width: '100%' }} />, the width transition won't trigger when menu is collapsed
      // https://github.com/ant-design/ant-design-pro/issues/2783
      const iconScaled = e.propertyName === 'font-size' && classNameValue.indexOf('anticon') >= 0;

      if (widthCollapsed || iconScaled) {
        restoreModeVerticalFromInline();
      }
    };
    const handleClick = (e) => {
      handleOpenChange([]);
      emit('click', e);
    };
    const handleSelect = (info) => {
      emit('select', info);
      emit('selectChange', info.selectedKeys);
    };
    const handleDeselect = (info) => {
      emit('deselect', info);
      emit('selectChange', info.selectedKeys);
    };
    const handleOpenChange = (openKeys) => {
      setOpenKeys(openKeys);
      emit('openChange', openKeys);
      emit('update:openKeys', openKeys);
    };
    const setOpenKeys = (sOpenKeys) => {
      if (props.openKeys === undefined) {
        openKeys.value = sOpenKeys;
      }
    };
    const getRealMenuMode = () => {
      const inlineCollapsed = getInlineCollapsed();
      if (switchingModeFromInline.value && inlineCollapsed) {
        return 'inline';
      }
      const {mode} = props;
      return inlineCollapsed ? 'vertical' : mode;
    };
    const getMenuOpenAnimation = (menuMode) => {
      const {openAnimation, openTransitionName} = props;
      let menuOpenAnimation = openAnimation || openTransitionName;
      if (openAnimation === undefined && openTransitionName === undefined) {
        if (menuMode === 'horizontal') {
          menuOpenAnimation = 'slide-up';
        } else if (menuMode === 'inline') {
          menuOpenAnimation = {on: animation};
        } else {
          // When mode switch from inline
          // submenu should hide without animation
          if (switchingModeFromInline) {
            menuOpenAnimation = '';
            switchingModeFromInline.value = false;
          } else {
            menuOpenAnimation = 'zoom-big';
          }
        }
      }
      return menuOpenAnimation;
    };
    const selectedKeys: Ref<Array<string | number>> = ref(props.selectedKeys || []);
    watch(() => props.selectedKeys, (value) => {
      setSelectedKeys(value);
    });
    watch(() => selectedKeys.value, (value) => {
      emit('update:selectedKeys', value);
    });
    const onSelect = (info: MenuItemInfo) => {
      if (props.selectable) {
        // root menu
        let tmpSelectedKeys = selectedKeys.value;
        const selectedKey = info.key;
        if (props.multiple) {
          tmpSelectedKeys = tmpSelectedKeys.concat([selectedKey]);
        } else {
          tmpSelectedKeys = [selectedKey];
        }
        if (props.selectedKeys === undefined) {
          setSelectedKeys(tmpSelectedKeys);
        }
        emit('select', {
          ...info,
          selectedKeys: tmpSelectedKeys
        });
      }
    };
    const onDeselect = (info: MenuItemInfo) => {
      if (props.selectable) {
        const tmpSelectedKeys = selectedKeys.value;
        const selectedKey = info.key;
        const index = tmpSelectedKeys.indexOf(selectedKey);
        if (index !== -1) {
          tmpSelectedKeys.splice(index, 1);
        }
        if (props.selectedKeys === undefined) {
          setSelectedKeys(tmpSelectedKeys);
        }
        emit('deselect', {
          ...info,
          selectedKeys: tmpSelectedKeys
        });
      }
    };
    const menuContext = reactive({
      multiple: props.multiple,
      mode: props.mode,
      theme: props.theme,
      itemIcon: props.itemIcon,
      rootPrefixCls: props.prefixCls,
      collapsed: props.inlineCollapsed,
      inlineIndent: props.inlineIndent,
      activeMenu: (menu: MenuItemInfo) => {
        onSelect(menu);
      },
      deactiveMenu: (menu: MenuItemInfo) => {
        onDeselect(menu);
      },
      getSelectedKeys: () => {
        return selectedKeys.value;
      },
      onMenuClick: (info) => {
        emit('click', info);
      }
    });
    watch(() => props, (value) => {
      menuContext.multiple = value.multiple;
      menuContext.mode = value.mode;
      menuContext.theme = value.theme;
      menuContext.collapsed = props.inlineCollapsed;
      menuContext.inlineIndent = props.inlineIndent;
      menuContext.rootPrefixCls = props.prefixCls;
      menuContext.itemIcon = props.itemIcon;
    }, {deep: true});
    const setSelectedKeys = (value: Array<string | number>) => {
      selectedKeys.value = value;
    };
    if (!inject(ProvideKeys.MenuContext)) {
      provide(ProvideKeys.MenuContext, menuContext);
    }
    const configProvider: any = inject('configProvider') || ConfigConsumerProps;
    return {
      handleSelect,
      handleClick,
      handleOpenChange,
      handleMouseEnter,
      handleDeselect,
      handleTransitionEnd,
      layoutSiderContext,
      openKeys,
      getInlineCollapsed,
      getMenuOpenAnimation,
      getRealMenuMode,
      configProvider,
      onKeyDown(e, callback) {
        // this.$refs.innerMenu.getWrappedInstance().onKeyDown(e, callback);
      }
    };
  },
  render(ctx) {
    const {$slots: slots, $props: props} = this;
    const {collapsedWidth} = ctx.layoutSiderContext;
    const {getPopupContainer: getContextPopupContainer} = this.configProvider;
    const {prefixCls: customizePrefixCls, theme, getPopupContainer} = this.$props;
    const getPrefixCls = this.configProvider.getPrefixCls;
    const prefixCls = getPrefixCls('menu', customizePrefixCls);
    const menuMode = this.getRealMenuMode();
    const menuOpenAnimation = this.getMenuOpenAnimation(menuMode);

    const menuClassName = {
      [`${prefixCls}-${theme}`]: true,
      [`${prefixCls}-inline-collapsed`]: this.getInlineCollapsed()
    };

    const menuProps = {
      ...omit(this.$props, ['inlineCollapsed']),
      getPopupContainer: getPopupContainer || getContextPopupContainer,
      openKeys: this.openKeys,
      mode: menuMode,
      prefixCls,
      selectedKeys: props.selectedKeys,
      openAnimation: props.openAnimation,
      openTransitionName: props.openTransitionName,
      onClick: props['onClick'],
      onSelect: this.handleSelect,
      onDeselect: this.handleDeselect,
      onOpenChange: this.handleOpenChange,
      onMouseenter: this.handleMouseEnter,
      onTransitionend: this.handleTransitionEnd
    };
    if (props.selectedKeys === undefined) {
      delete menuProps.selectedKeys;
    }

    if (menuMode !== 'inline') {
      // closing vertical popup submenu after click it
      menuProps.onClick = this.handleClick;
      menuProps.openTransitionName = menuOpenAnimation;
    } else {
      menuProps.onClick = e => {
        this.$emit('click', e);
      };
      menuProps.openAnimation = menuOpenAnimation;
    }

    // https://github.com/ant-design/ant-design/issues/8587
    const hideMenu =
      this.getInlineCollapsed() &&
      (collapsedWidth === 0 || collapsedWidth === '0' || collapsedWidth === '0px');
    if (hideMenu) {
      menuProps.openKeys = [];
    }
    return (
      <ul role="menu" class={[
        prefixCls,
        `${prefixCls}-${this.$props.mode}`,
        `${prefixCls}-root`,
        `${prefixCls}-${this.$props.theme}`
      ]}>
        {slots.default && slots.default()}
      </ul>
    );
  }
});

Menu.Divider = Divider;
Menu.ItemGroup = ItemGroup;
Menu.Item = Item;
Menu.SubMenu = SubMenu;

/* istanbul ignore next */
Menu.install = function(Vue) {
  Vue.use(Base);
  Vue.component(Menu.name, Menu);
  Vue.component(Menu.Item.name, Menu.Item);
  Vue.component(Menu.SubMenu.name, Menu.SubMenu);
  Vue.component(Menu.Divider.name, Menu.Divider);
  Vue.component(Menu.ItemGroup.name, Menu.ItemGroup);
};
export default Menu as any;
