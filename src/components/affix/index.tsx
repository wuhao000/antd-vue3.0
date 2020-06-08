import {useRefs} from '@/components/vc-tabs/src/save-ref';
import {useState} from '@/tools/state';
import classNames from 'classnames';
import omit from 'omit.js';
import {defineComponent, getCurrentInstance, onBeforeUnmount, onMounted, onUpdated, watch} from 'vue';
import throttleByAnimationFrame from '../_util/throttle-by-animation-frame';
import PropTypes from '../_util/vue-types';
import warning from '../_util/warning';
import Base from '../base';
import {useConfigProvider} from '../config-provider';
import ResizeObserver from '../vc-resize-observer';
import {addObserveTarget, getFixedBottom, getFixedTop, getTargetRect, removeObserveTarget} from './utils';

function getDefaultTarget() {
  return typeof window !== 'undefined' ? window : null;
}

// Affix
const AffixProps = {
  /**
   * 距离窗口顶部达到指定偏移量后触发
   */
  offsetTop: PropTypes.number,
  offset: PropTypes.number,
  /** 距离窗口底部达到指定偏移量后触发 */
  offsetBottom: PropTypes.number,
  /** 固定状态改变时触发的回调函数 */
  // onChange?: (affixed?: boolean) => void;
  /** 设置 Affix 需要监听其滚动事件的元素，值为一个返回对应 DOM 元素的函数 */
  target: PropTypes.func.def(() => getDefaultTarget),
  prefixCls: PropTypes.string
};
const AffixStatus = {
  None: 'none',
  Prepare: 'Prepare'
};
const Affix = defineComponent({
  name: 'AAffix',
  props: AffixProps,
  watch: {
    offsetTop() {
    },
    offsetBottom() {
    }
  },
  setup($props, {emit}) {
    const instance = getCurrentInstance();
    watch(() => $props.offsetTop, () => {
      updatePosition();
    });
    watch(() => $props.offsetBottom, () => {
      updatePosition();
    });
    const {state: $state, setState} = useState<any>({
      affixStyle: undefined,
      placeholderStyle: undefined,
      status: AffixStatus.None,
      lastAffix: false,
      prevTarget: null,
      timeout: null
    });
    watch(() => $props.target, (val) => {
      let newTarget = null;
      if (val) {
        newTarget = val() || null;
      }
      if ($state.prevTarget !== newTarget) {
        removeObserveTarget(instance);
        if (newTarget) {
          addObserveTarget(newTarget, instance);
          // Mock Event object.
          updatePosition();
        }
        $state.prevTarget = newTarget;
      }
    });
    const getOffsetTop = () => {
      const {offset, offsetBottom} = $props;
      let {offsetTop} = $props;
      if (typeof offsetTop === 'undefined') {
        offsetTop = offset;
        warning(
            typeof offset === 'undefined',
            'Affix',
            '`offset` is deprecated. Please use `offsetTop` instead.'
        );
      }

      if (offsetBottom === undefined && offsetTop === undefined) {
        offsetTop = 0;
      }
      return offsetTop;
    };
    const getOffsetBottom = () => {
      return $props.offsetBottom;
    };
    const {getRef, saveRef} = useRefs();
    const measure = () => {
      const {status, lastAffix} = $state;
      const {target} = $props;
      if (
          status !== AffixStatus.Prepare ||
          !getRef('fixedNode') ||
          !getRef('placeholderNode') ||
          !target
      ) {
        return;
      }

      const offsetTop = getOffsetTop();
      const offsetBottom = getOffsetBottom();
      const targetNode = target();
      if (!targetNode) {
        return;
      }
      const newState: any = {
        status: AffixStatus.None
      };
      const targetRect = getTargetRect(targetNode);
      const placeholderReact = getTargetRect(getRef('placeholderNode'));
      const fixedTop = getFixedTop(placeholderReact, targetRect, offsetTop);
      const fixedBottom = getFixedBottom(placeholderReact, targetRect, offsetBottom);
      if (fixedTop !== undefined) {
        newState.affixStyle = {
          position: 'fixed',
          top: fixedTop,
          width: placeholderReact.width + 'px',
          height: placeholderReact.height + 'px'
        };
        newState.placeholderStyle = {
          width: placeholderReact.width + 'px',
          height: placeholderReact.height + 'px'
        };
      } else if (fixedBottom !== undefined) {
        newState.affixStyle = {
          position: 'fixed',
          bottom: fixedBottom,
          width: placeholderReact.width + 'px',
          height: placeholderReact.height + 'px'
        };
        newState.placeholderStyle = {
          width: placeholderReact.width + 'px',
          height: placeholderReact.height + 'px'
        };
      }
      newState.lastAffix = !!newState.affixStyle;
      if (lastAffix !== newState.lastAffix) {
        emit('change', newState.lastAffix);
      }
      setState(newState);
    };
    const prepareMeasure = () => {
      setState({
        status: AffixStatus.Prepare,
        affixStyle: undefined,
        placeholderStyle: undefined
      });
      measure();
      // Test if `updatePosition` called
      if (process.env.NODE_ENV === 'test') {
        emit('testUpdatePosition');
      }
    };
    const updatePosition = throttleByAnimationFrame(() => {
      prepareMeasure();
    });
    const lazyUpdatePosition = throttleByAnimationFrame(() => {
      const {target} = $props;
      const {affixStyle} = $state;

      // Check position change before measure to make Safari smooth
      if (target && affixStyle) {
        const offsetTop = getOffsetTop();
        const offsetBottom = getOffsetBottom();

        const targetNode = target();
        if (targetNode && getRef('placeholderNode')) {
          const targetRect = getTargetRect(targetNode);
          const placeholderReact = getTargetRect(getRef('placeholderNode'));
          const fixedTop = getFixedTop(placeholderReact, targetRect, offsetTop);
          const fixedBottom = getFixedBottom(placeholderReact, targetRect, offsetBottom);

          if (
              (fixedTop !== undefined && affixStyle.top === fixedTop) ||
              (fixedBottom !== undefined && affixStyle.bottom === fixedBottom)
          ) {
            return;
          }
        }
      }
      // Directly call prepare measure since it's already throttled.
      prepareMeasure();
    });
    onMounted(() => {
      const {target} = $props;
      if (target) {
        // [Legacy] Wait for parent component ref has its value.
        // We should use target as directly element instead of function which makes element check hard.
        $state.timeout = setTimeout(() => {
          addObserveTarget(target(), instance);
          // Mock Event object.
          updatePosition();
        });
      }
    });
    onUpdated(() => {
      measure();
    });
    onBeforeUnmount(() => {
      clearTimeout($state.timeout);
      removeObserveTarget(instance);
      (updatePosition as any).cancel();
    });
    return {
      getOffsetTop,
      getOffsetBottom,
      measure,
      prepareMeasure,
      updatePosition,
      lazyUpdatePosition,
      saveRef,
      $state,
      configProvider: useConfigProvider(),
      getAffixStyle() {
        return $state.affixStyle;
      }
    };
  },
  render() {
    const affixStyle = this.getAffixStyle();
    const {prefixCls, $slots, $props} = this;
    const {placeholderStyle} = this.$state;
    const getPrefixCls = this.configProvider.getPrefixCls;
    const className = classNames({
      [getPrefixCls('affix', prefixCls)]: affixStyle
    });
    const props = {
      ...omit($props, ['prefixCls', 'offsetTop', 'offsetBottom', 'target'])
    };
    return (
        <ResizeObserver
            onResize={() => {
              this.updatePosition();
            }}>
          <div {...props} style={placeholderStyle} ref={this.saveRef('placeholderNode')}>
            <div class={className} ref={this.saveRef('fixedNode')} style={affixStyle}>
              {$slots.default && $slots.default()}
            </div>
          </div>
        </ResizeObserver>
    );
  }
});

/* istanbul ignore next */
Affix.install = function(Vue) {
  Vue.use(Base);
  Vue.component(Affix.name, Affix);
};

export default Affix;
