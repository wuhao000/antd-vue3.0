import {defineComponent, onBeforeUnmount, onMounted, onUpdated, ref, watch} from 'vue';
import {getComponentFromContext, getListenersFromContext, getStyleFromContext} from '../_util/props-util';
import PropTypes from '../_util/vue-types';

function noop() {
}

export default defineComponent({
  props: {
    duration: PropTypes.number.def(1.5),
    closable: PropTypes.bool,
    prefixCls: PropTypes.string,
    update: PropTypes.bool,
    closeIcon: PropTypes.any
  },
  setup($props, {emit}) {
    const willDestroy = ref(false);
    watch(() => $props.duration, () => {
      restartCloseTimer();
    });
    const close = (e?) => {
      if (e) {
        e.stopPropagation();
      }
      clearCloseTimer();
      emit('close');
    };
    const closeTimer = ref(undefined);
    const startCloseTimer = () => {
      clearCloseTimer();
      if (!willDestroy.value && $props.duration) {
        closeTimer.value = setTimeout(() => {
          close();
        }, $props.duration * 1000);
      }
    };
    const clearCloseTimer = () => {
      if (closeTimer.value) {
        clearTimeout(closeTimer.value);
        closeTimer.value = null;
      }
    };
    const restartCloseTimer = () => {
      clearCloseTimer();
      startCloseTimer();
    };
    onMounted(() => {
      startCloseTimer();
    });
    onUpdated(() => {
      if ($props.update) {
        restartCloseTimer();
      }
    });
    onBeforeUnmount(() => {
      clearCloseTimer();
      willDestroy.value = true; // beforeDestroy调用后依然会触发onMouseleave事件
    });
    return {
      close,
      startCloseTimer,
      clearCloseTimer,
      restartCloseTimer
    };
  },
  render() {
    const {prefixCls, closable, clearCloseTimer, startCloseTimer, $slots, close} = this;
    const componentClass = `${prefixCls}-notice`;
    const className = {
      [`${componentClass}`]: 1,
      [`${componentClass}-closable`]: closable
    };
    const style = getStyleFromContext(this);
    const closeIcon = getComponentFromContext(this, 'closeIcon');
    return (
        <div
            class={className}
            style={style || {right: '50%'}}
            onMouseenter={clearCloseTimer}
            onMouseleave={startCloseTimer}
            onClick={getListenersFromContext(this).click || noop}>
          <div class={`${componentClass}-content`}>{$slots.default && $slots.default()}</div>
          {closable ? (
              <a tabindex={0} onClick={close} class={`${componentClass}-close`}>
                {closeIcon || <span class={`${componentClass}-close-x`}/>}
              </a>
          ) : null}
        </div>
    );
  }
}) as any;
