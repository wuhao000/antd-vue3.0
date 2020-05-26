import classNames from 'classnames';
import {
  defineComponent,
  getCurrentInstance,
  h,
  inject,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  watch,
  Ref,
  nextTick
} from 'vue';
import isNumeric from '../_util/isNumeric';
import {getPrefixCls} from '../_util/prefix';
import {getComponentFromProp, getOptionProps, hasProp, initDefaultProps} from '../_util/props-util';
import PropTypes from '../_util/vue-types';
import Icon from '../icon';

// matchMedia polyfill for
// https://github.com/WickyNilliams/enquire.js/issues/82
if (typeof window !== 'undefined') {
  const matchMediaPolyfill = (mediaQuery: string) => {
    return {
      media: mediaQuery,
      matches: false,
      addListener(listener: ((this: MediaQueryList, ev: MediaQueryListEvent) => any) | null) {
      },
      removeListener(listener: ((this: MediaQueryList, ev: MediaQueryListEvent) => any) | null) {
      }
    } as MediaQueryList;
  };
  window.matchMedia = window.matchMedia || matchMediaPolyfill;
}

const dimensionMaxMap: any = {
  xs: '479.98px',
  sm: '575.98px',
  md: '767.98px',
  lg: '991.98px',
  xl: '1199.98px',
  xxl: '1599.98px'
};

// export type CollapseType = 'clickTrigger' | 'responsive';

export const SiderProps = {
  prefixCls: PropTypes.string,
  collapsible: PropTypes.bool,
  collapsed: PropTypes.bool,
  defaultCollapsed: PropTypes.bool,
  reverseArrow: PropTypes.bool,
  // onCollapse?: (collapsed: boolean, type: CollapseType) => void;
  zeroWidthTriggerStyle: PropTypes.object,
  trigger: PropTypes.any,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  collapsedWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  breakpoint: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', 'xxl']),
  theme: (PropTypes.oneOf(['light', 'dark']) as any).def('dark')
};

export interface LayoutSiderContext {
  collapse: Ref<boolean>
}

// export interface SiderState {
//   collapsed?: boolean;
//   below: boolean;
//   belowShow?: boolean;
// }

// export interface SiderContext {
//   siderCollapsed: boolean;
// }

const generateId = (() => {
  let i = 0;
  return (prefix = '') => {
    i += 1;
    return `${prefix}${i}`;
  };
})();
const sider = defineComponent({
  name: 'ALayoutSider',
  setup(declareProps, {attrs, emit}) {
    const props: any = {...declareProps, ...attrs};
    const uniqueId = ref(generateId('ant-sider-'));
    const mql = ref({} as MediaQueryList);
    let matchMedia = null;
    if (typeof window !== 'undefined') {
      matchMedia = window.matchMedia;
    }
    if (matchMedia !== null && props.breakpoint && props.breakpoint in dimensionMaxMap) {
      mql.value = matchMedia(`(max-width: ${dimensionMaxMap[props.breakpoint]})`);
    }
    const sCollapsed = ref(false);
    if ('collapsed' in props) {
      sCollapsed.value = props.collapsed;
    } else {
      sCollapsed.value = props.defaultCollapsed;
    }
    provide('layoutSiderContext', {
      collapse: sCollapsed
    } as LayoutSiderContext);
    const siderHook: { addSider: (id: string) => any, removeSider: (id: string) => any } | undefined = inject('siderHook');
    watch(() => props.collapsed, (value: boolean) => {
      sCollapsed.value = value;
    });
    onMounted(() => {
      nextTick(() => {
        if (mql.value.addListener) {
          mql.value.addListener(responsiveHandler);
          responsiveHandler(mql.value);
        }
        if (siderHook?.addSider) {
          siderHook?.addSider(uniqueId.value);
        }
      });
    });
    onBeforeUnmount(() => {
      if (mql.value.removeListener !== undefined) {
        mql.value.removeListener(responsiveHandler);
      }
      if (siderHook?.removeSider) {
        siderHook?.removeSider(uniqueId.value);
      }
    });
    const below = ref(false);
    const responsiveHandler = (mql: any) => {
      below.value = mql.matches;
      emit('breakpoint', mql.matches);
      if (sCollapsed.value !== mql.matches) {
        setCollapsed(mql.matches, 'responsive');
      }
    };

    const setCollapsed = (collapsed: boolean, type: string) => {
      if (props.collapsed === undefined) {
        sCollapsed.value = collapsed;
      }
      emit('collapse', collapsed, type);
    };

    const toggle = () => {
      const collapsed = !sCollapsed.value;
      setCollapsed(collapsed, 'clickTrigger');
    };
    const belowShow = ref(false);
    const belowShowChange = () => {
      belowShow.value = !belowShow.value;
    };
    return {
      sCollapsed,
      below,
      belowShow,
      siderHook,
      setCollapsed, toggle, responsiveHandler, belowShowChange
    };
  },
  model: {
    prop: 'collapsed',
    event: 'collapse'
  },
  props: initDefaultProps(SiderProps, {
    collapsible: false,
    defaultCollapsed: false,
    reverseArrow: false,
    width: 200,
    collapsedWidth: 80
  }),
  render(ctx: any) {
    const {
      prefixCls: customizePrefixCls,
      theme,
      collapsible,
      reverseArrow,
      width,
      collapsedWidth,
      zeroWidthTriggerStyle
    } = getOptionProps(getCurrentInstance());
    const prefixCls = getPrefixCls('layout-sider', customizePrefixCls);
    const componentInstance = getCurrentInstance();
    const trigger = getComponentFromProp(componentInstance, 'trigger');
    const rawWidth = this.sCollapsed ? collapsedWidth : width;
    // use "px" as fallback unit for width
    const siderWidth = isNumeric(rawWidth) ? `${rawWidth}px` : String(rawWidth);
    // special trigger when collapsedWidth == 0
    const zeroWidthTrigger =
        parseFloat(String(collapsedWidth || 0)) === 0 ? (
            <span
                onClick={this.toggle}
                class={`${prefixCls}-zero-width-trigger ${prefixCls}-zero-width-trigger-${
                    reverseArrow ? 'right' : 'left'
                }`}
                style={zeroWidthTriggerStyle}>
              {h(Icon, {type: 'bars'})}
            </span>
        ) : null;

    const iconObj = {
      expanded: <Icon type={reverseArrow ? 'right' : 'left'}/>,
      collapsed: <Icon type={reverseArrow ? 'left' : 'right'}/>
    };
    const status = this.sCollapsed ? 'collapsed' : 'expanded';
    const defaultTrigger = iconObj[status];
    const triggerDom =
        trigger !== null
            ? zeroWidthTrigger || (
            <div class={`${prefixCls}-trigger`} onClick={this.toggle} style={{width: siderWidth}}>
              {trigger || defaultTrigger}
            </div>
        )
            : null;
    const divStyle = {
      // ...style,
      flex: `0 0 ${siderWidth}`,
      maxWidth: siderWidth, // Fix width transition bug in IE11
      minWidth: siderWidth, // https://github.com/ant-design/ant-design/issues/6349
      width: siderWidth
    };
    const siderCls = classNames(prefixCls, `${prefixCls}-${theme}`, {
      [`${prefixCls}-collapsed`]: !!this.sCollapsed,
      [`${prefixCls}-has-trigger`]: collapsible && trigger !== null && !zeroWidthTrigger,
      [`${prefixCls}-below`]: !!this.below,
      [`${prefixCls}-zero-width`]: parseFloat(siderWidth) === 0
    });
    return <aside class={siderCls} style={divStyle}>
      <div class={`${prefixCls}-children`}>
        {this.$slots.default && this.$slots.default()}
      </div>
      {collapsible || (this.below && zeroWidthTrigger) ? triggerDom : null}
    </aside>;
  }
});
export default sider;
