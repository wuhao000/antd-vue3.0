import {addEvent} from '@/components/_util/vnode';
import trigger from '@/components/vc-trigger/trigger';
import {alignElement} from 'dom-align';
import {computed, defineComponent, getCurrentInstance, onUpdated, ref, Teleport, watch} from 'vue';
import {getComponentFromProp, getListeners, getOptionProps, hasProp} from '../_util/props-util';
import PropTypes from '../_util/vue-types';
import {placements} from './placements';

function noop() {
}

export default defineComponent({
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
    arrowContent: PropTypes.any.def(null),
    tipId: PropTypes.string,
    builtinPlacements: PropTypes.object
  },
  setup(props, {attrs, emit, slots}) {
    const contentRef = ref(null);
    const target = computed(() => attrs.child);
    onUpdated(() => {
      if (contentRef.value) {
        alignElement(contentRef.value, target.value.el, placements[props.placement]);
      }
    });
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
    const getPopupDomNode = () => {
      return this.$refs.trigger.getPopupDomNode();
    };
    if (props.trigger === 'hover') {
      addEvent(target.value, 'onMouseover', () => {
        props.onVisibleChange && props.onVisibleChange(true);
      });
      addEvent(target.value, 'onMouseleave', () => {
        props.onVisibleChange && props.onVisibleChange(false);
      });
    } else if (props.trigger === 'click') {

    }
    return {
      getPopupElement, target, setContentRef: (el) => {
        contentRef.value = el;
      }, getPopupDomNode
    };
  },
  render(ctx) {
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
      align,
      destroyTooltipOnHide,
      defaultVisible,
      getTooltipContainer,
      ...restProps
    } = getOptionProps(this);
    const extraProps = {...restProps};
    if (hasProp(this, 'visible')) {
      extraProps.popupVisible = this.$props.visible;
    }
    const listeners = getListeners(this);
    const triggerProps = {
      props: {
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
        ...extraProps
      },
      on: {
        ...listeners,
        popupVisibleChange: listeners.visibleChange || noop,
        popupAlign: listeners.popupAlign || noop
      },
      ref: 'trigger'
    };
    const props = {
      class: {[prefixCls]: true, [prefixCls + '-placement-' + this.$props.placement]: true},
      ref: ctx.setContentRef
    };
    console.log(ctx.target.props.class);
    // @ts-ignore
    return [<Teleport to="body">
      {this.$props.visible ? <div {...props}>
        <div class={`${prefixCls}-content`}>
          <div class={`${prefixCls}-arrow`}/>
          <div role="tooltip" class={`${prefixCls}-inner`}>{this.$props.title}</div>
        </div>
      </div> : null}
    </Teleport>, ctx.target];
  }
}) as any;
