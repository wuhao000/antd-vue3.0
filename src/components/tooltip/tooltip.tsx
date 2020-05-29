import {addEvent} from '@/components/_util/vnode';
import classNames from 'classnames';
import {defineComponent, cloneVNode, getCurrentInstance, inject, ref, VNode, watch} from 'vue';
import {getClassFromVNode, getComponentFromProp, getStyleFromInstance, hasProp, isValidElement} from '../_util/props-util';
import PropTypes from '../_util/vue-types';
import {ConfigConsumerProps} from '../config-provider';
import VcTooltip from '../vc-tooltip';
import abstractTooltipProps from './abstract-tooltip-props';
import Placements from './placements';

const splitObject = (obj, keys) => {
  const picked = {};
  const omitted = {...obj};
  keys.forEach(key => {
    if (obj && key in obj) {
      picked[key] = obj[key];
      delete omitted[key];
    }
  });
  return {picked, omitted};
};
const props = abstractTooltipProps();
export default defineComponent({
  name: 'ATooltip',
  props: {
    ...props,
    title: PropTypes.any
  },
  setup(props, {emit}) {
    const componentInstance = getCurrentInstance();
    const configProvider = inject('configProvider', ConfigConsumerProps);
    const sVisible = ref(!!props.visible || !!props.defaultVisible);
    watch(() => props.visible, (val) => {
      sVisible.value = val;
    });
    const onVisibleChange = (visible) => {
      if (props.visible === undefined) {
        sVisible.value = isNoTitle() ? false : visible;
      }
      if (!isNoTitle()) {
        emit('update:visible', visible);
      }
    };
    const getPlacements = () => {
      const {builtinPlacements, arrowPointAtCenter, autoAdjustOverflow} = props;
      return (
          builtinPlacements ||
          Placements({
            arrowPointAtCenter,
            verticalArrowShift: 8,
            autoAdjustOverflow
          })
      );
    };
    const getDisabledCompatibleChildren = (ele) => {
      const options = (ele.componentOptions && ele.componentOptions.Ctor.options) || {};

      if (
          ((options.__ANT_BUTTON === true ||
              options.__ANT_SWITCH === true ||
              options.__ANT_CHECKBOX === true) &&
              (ele.componentOptions.propsData.disabled ||
                  ele.componentOptions.propsData.disabled === '')) ||
          (ele.tag === 'button' &&
              ele.data &&
              ele.data.attrs &&
              ele.data.attrs.disabled !== undefined)
      ) {
        // Pick some layout related style properties up to span
        // Prevent layout bugs like https://github.com/ant-design/ant-design/issues/5254
        const {picked, omitted} = splitObject(getStyleFromInstance(ele), [
          'position',
          'left',
          'right',
          'top',
          'bottom',
          'float',
          'display',
          'zIndex'
        ]);
        const spanStyle = {
          display: 'inline-block', // default inline-block is important
          ...picked,
          cursor: 'not-allowed',
          width: ele.componentOptions.propsData.block ? '100%' : null
        };
        const buttonStyle = {
          ...omitted,
          pointerEvents: 'none'
        };
        const spanCls = getClassFromVNode(ele);
        const child = cloneVNode(ele, {
          style: buttonStyle,
          class: null
        });
        return (
            <span style={spanStyle} class={spanCls}>
              {child}
            </span>
        );
      }
      return ele;
    };
    const isNoTitle = () => {
      const title = getComponentFromProp(componentInstance, 'title');
      return !title && title !== 0;
    };
    const getOverlay = () => {
      const title = getComponentFromProp(componentInstance, 'title');
      if (title === 0) {
        return title;
      }
      return title || '';
    };
    // 动态设置动画点
    const onPopupAlign = (domNode, align) => {
      const placements = getPlacements();
      // 当前返回的位置
      const placement = Object.keys(placements).filter(
          key =>
              placements[key].points[0] === align.points[0] &&
              placements[key].points[1] === align.points[1]
      )[0];
      if (!placement) {
        return;
      }
      // 根据当前坐标设置动画点
      const rect = domNode.getBoundingClientRect();
      const transformOrigin = {
        top: '50%',
        left: '50%'
      };
      if (placement.indexOf('top') >= 0 || placement.indexOf('Bottom') >= 0) {
        transformOrigin.top = `${rect.height - align.offset[1]}px`;
      } else if (placement.indexOf('Top') >= 0 || placement.indexOf('bottom') >= 0) {
        transformOrigin.top = `${-align.offset[1]}px`;
      }
      if (placement.indexOf('left') >= 0 || placement.indexOf('Right') >= 0) {
        transformOrigin.left = `${rect.width - align.offset[0]}px`;
      } else if (placement.indexOf('right') >= 0 || placement.indexOf('Left') >= 0) {
        transformOrigin.left = `${-align.offset[0]}px`;
      }
      domNode.style.transformOrigin = `${transformOrigin.left} ${transformOrigin.top}`;
    };
    const addTriggerEvent = (el: VNode) => {
      if (props.trigger === 'hover') {
        addEvent(el, 'onMouseover', () => {
          onVisibleChange && onVisibleChange(true);
        });
        addEvent(el, 'onMouseleave', () => {
          onVisibleChange && onVisibleChange(false);
        });
      } else if (props.trigger === 'click') {

      }
    };
    return {
      addTriggerEvent,
      sVisible,
      configProvider,
      getOverlay,
      onPopupAlign,
      onVisibleChange,
      getPlacements,
      isNoTitle,
      getDisabledCompatibleChildren
    };
  },
  render(ctx) {
    const componentInstance = getCurrentInstance();
    const {$props, $slots} = this;
    if (!$slots.default) {
      return null;
    }
    const {prefixCls: customizePrefixCls, getPopupContainer} = $props;
    const {getPopupContainer: getContextPopupContainer} = this.configProvider;
    const getPrefixCls = ctx.configProvider.getPrefixCls;
    const prefixCls = getPrefixCls('tooltip', customizePrefixCls);
    let children: VNode[] | VNode = ($slots.default() || []).filter(c => typeof c.children !== 'string' || c.children.trim() !== '');
    children = children.length === 1 ? children[0] : children;
    let sVisible = ctx.sVisible;
    // Hide tooltip when there is no title
    if (!hasProp(componentInstance, 'visible') && this.isNoTitle()) {
      sVisible = false;
    }
    if (!children) {
      return null;
    }
    const child = ctx.getDisabledCompatibleChildren(
        isValidElement(children) ? children : <span>{children}</span>
    );
    const childCls = {
      [`${prefixCls}-open`]: true
    };
    const tooltipProps = {
      ...$props,
      prefixCls,
      getTooltipContainer: getPopupContainer || getContextPopupContainer,
      builtinPlacements: ctx.getPlacements(),
      overlay: ctx.getOverlay(),
      visible: sVisible,
      ref: 'tooltip',
      onVisibleChange: ctx.onVisibleChange,
      onPopupAlign: ctx.onPopupAlign
    };
    if (sVisible) {
      if (child.props.class) {
        child.props.class = classNames(child.props.class,
          'ant-menu-item-selected',
          childCls);
      } else {
        child.props.class = classNames(childCls);
      }
    }
    ctx.addTriggerEvent(child);
    return (
        <VcTooltip target={child} {...tooltipProps}>
          {child}
        </VcTooltip>
    );
  }
}) as any;
