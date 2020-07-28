import {useAlign} from '@/components/vc-align';
import Trigger from '@/components/vc-trigger/trigger';
import {computed, ComputedRef, defineComponent, getCurrentInstance, ref} from 'vue';
import {getComponentFromProp, getListenersFromInstance, getOptionProps, hasProp} from '../_util/props-util';
import PropTypes from '../_util/vue-types';
import {placements} from './placements';

function noop() {
}

export default defineComponent({
  inheritAttrs: false,
  props: {
    trigger: PropTypes.any.def(['hover']),
    defaultVisible: PropTypes.bool,
    visible: PropTypes.bool,
    placement: PropTypes.string.def('right'),
    transitionName: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    animation: PropTypes.any,
    afterVisibleChange: PropTypes.func.def(() => {
    }),
    title: PropTypes.any,
    overlay: PropTypes.any,
    overlayStyle: PropTypes.object,
    onVisibleChange: PropTypes.func,
    overlayClassName: PropTypes.string,
    prefixCls: PropTypes.string.def('rc-tooltip'),
    mouseEnterDelay: PropTypes.number.def(0),
    mouseLeaveDelay: PropTypes.number.def(0.1),
    getTooltipContainer: PropTypes.func,
    destroyTooltipOnHide: PropTypes.bool.def(false),
    align: PropTypes.object.def(() => ({})),
    target: PropTypes.object,
    arrowContent: PropTypes.any.def(null),
    tipId: PropTypes.string,
    builtinPlacements: PropTypes.object
  },
  setup(props) {
    const contentRef = ref(null);
    const targetEl: ComputedRef = computed(() => props.target.el);
    useAlign(contentRef, targetEl, props.placement);
    const getPopupElement = () => {
      const instance = getCurrentInstance();
      const {prefixCls, overlay} = props;
      return [
        <div class={`${prefixCls}-arrow`} key="arrow">
          {getComponentFromProp(instance, 'arrowContent')}
        </div>,
        <div class={`${prefixCls}-inner`} role="tooltip">
          {typeof overlay === 'function' ? overlay() : overlay}
        </div>
      ];
    };
    return {
      getPopupElement,
      setContentRef: (el) => {
        contentRef.value = el;
      }
    };
  },
  render(ctx) {
    const instance = getCurrentInstance();
    const {
      overlayClassName,
      trigger,
      mouseEnterDelay,
      mouseLeaveDelay,
      overlayStyle,
      prefixCls,
      afterVisibleChange,
      transitionName,
      animation,
      placement,
      visible,
      align,
      destroyTooltipOnHide,
      defaultVisible,
      getTooltipContainer,
      ...restProps
    } = getOptionProps(instance);
    const extraProps = {...restProps};
    if (hasProp(instance, 'visible')) {
      extraProps.popupVisible = this.$props.visible;
    }
    const listeners = getListenersFromInstance(instance);
    const triggerProps = {
      ...extraProps,
      ...listeners,
      popupClassName: overlayClassName,
      prefixCls,
      action: trigger,
      builtinPlacements: placements,
      popupPlacement: placement,
      popupAlign: align,
      getPopupContainer: getTooltipContainer,
      afterPopupVisibleChange: afterVisibleChange,
      popupTransitionName: transitionName,
      popupAnimation: animation,
      defaultPopupVisible: defaultVisible,
      destroyPopupOnHide: destroyTooltipOnHide,
      mouseLeaveDelay,
      popupStyle: overlayStyle,
      mouseEnterDelay,
      onPopupVisibleChange: listeners.onVisibleChange || noop,
      onPopupAlign: listeners.onPopupAlign || noop,
      ref: 'trigger'
    };
    return (
        <Trigger {...triggerProps}
                 slots={{
                   popup: this.getPopupElement(),
                   default: this.$slots.default
                 }}/>
    );
  }
}) as any;
