import {cloneVNode, defineComponent, nextTick, onMounted, ref} from 'vue';
import {initDefaultProps} from '../../_util/props-util';
import warning from '../../_util/warning';
import {ITouchProps} from './prop-types';

export default defineComponent({
  name: 'TouchFeedback',
  inheritAttrs: false,
  props: initDefaultProps(ITouchProps, {
    disabled: false
  }),
  setup(props, {emit}) {
    const active = ref(false);
    onMounted(() => {
      nextTick(() => {
        if (props.disabled && active.value) {
          active.value = false;
        }
      });
    });
    const triggerEvent = (type, isActive, ev) => {
      // 暂时仅有input-number用到，事件直接到挂载到Touchable上，不需要像antd那样从子组件触发
      emit(type, ev);
      if (isActive !== active.value) {
        active.value = isActive;
      }
    };
    return {
      active,
      triggerEvent,
      onTouchStart(e) {
        triggerEvent('touchstart', true, e);
      },
      onTouchMove(e) {
        triggerEvent('touchmove', false, e);
      },
      onTouchEnd(e) {
        triggerEvent('touchend', false, e);
      },
      onTouchCancel(e) {
        triggerEvent('touchcancel', false, e);
      },
      onMouseDown(e) {
        // pc simulate mobile
        triggerEvent('mousedown', true, e);
      },
      onMouseUp(e) {
        triggerEvent('mouseup', false, e);
      },
      onMouseLeave(e) {
        triggerEvent('mouseleave', false, e);
      }
    };
  },
  render(ctx) {
    const {disabled, activeClassName = '', activeStyle = {}} = ctx;
    const child = ctx.$slots.default();
    if (!Array.isArray(child) || child.length !== 1) {
      warning(false, 'm-feedback组件只能包含一个子元素');
      return null;
    }
    let childProps = disabled ? {} : {
      onTouchstart: ctx.onTouchStart,
      onTouchmove: ctx.onTouchMove,
      onTouchend: ctx.onTouchEnd,
      onTouchcancel: ctx.onTouchCancel,
      onMousedown: ctx.onMouseDown,
      onMouseup: ctx.onMouseUp,
      onMouseleave: ctx.onMouseLeave
    };
    if (!disabled && ctx.active) {
      childProps = {
        ...childProps,
        ...{
          style: activeStyle,
          class: activeClassName
        }
      };
    }
    return cloneVNode(child[0], childProps);
  }
}) as any;
