import {useConfigProvider} from '@/components/config-provider';
import debounce from 'lodash/debounce';
import {defineComponent, getCurrentInstance, nextTick, onBeforeUnmount, onMounted, onUpdated, ref} from 'vue';
import {
  filterEmpty,
  getComponentFromProp,
  getListenersFromInstance,
  initDefaultProps,
  isValidElement
} from '../_util/props-util';
import {cloneElement} from '../_util/vnode';
import PropTypes from '../_util/vue-types';

export const SpinSize = PropTypes.oneOf(['small', 'default', 'large']);

export const SpinProps = () => ({
  prefixCls: PropTypes.string,
  spinning: PropTypes.bool,
  size: SpinSize,
  wrapperClassName: PropTypes.string,
  tip: PropTypes.string,
  delay: PropTypes.number,
  indicator: PropTypes.any
});

// Render indicator
let defaultIndicator;

function shouldDelay(spinning, delay) {
  return !!spinning && !!delay && !isNaN(Number(delay));
}

export function setDefaultIndicator(Content) {
  const Indicator = Content.indicator;
  defaultIndicator =
      typeof Indicator === 'function'
          ? Indicator
          : () => {
            return <Indicator/>;
          };
}

export default defineComponent({
  name: 'ASpin',
  props: initDefaultProps(SpinProps(), {
    size: 'default',
    spinning: true,
    wrapperClassName: ''
  }),
  setup(props, {slots}) {
    const sSpinning = ref(props.spinning && !shouldDelay(props.spinning, props.delay));
    let updateSpinning: any = () => {
      const {spinning} = props;
      if (sSpinning.value !== spinning) {
        sSpinning.value = spinning;
      }
    };
    const cancelExistingSpin = () => {
      if (updateSpinning && updateSpinning.cancel) {
        updateSpinning.cancel();
      }
    };
    const debouncifyUpdateSpinning = () => {
      const {delay} = props;
      if (delay) {
        cancelExistingSpin();
        updateSpinning = debounce(updateSpinning, delay);
      }
    };
    debouncifyUpdateSpinning();
    const getChildren = () => {
      if (slots.default) {
        return filterEmpty(slots.default);
      }
      return null;
    };
    const instance = getCurrentInstance();
    const renderIndicator = (prefixCls) => {
      const dotClassName = `${prefixCls}-dot`;
      let indicator = getComponentFromProp(instance, 'indicator');
      // should not be render default indicator when indicator value is null
      if (indicator === null) {
        return null;
      }
      if (Array.isArray(indicator)) {
        indicator = filterEmpty(indicator);
        indicator = indicator.length === 1 ? indicator[0] : indicator;
      }
      if (isValidElement(indicator)) {
        return cloneElement(indicator, {class: dotClassName});
      }

      if (defaultIndicator && isValidElement(defaultIndicator())) {
        return cloneElement(defaultIndicator(), {class: dotClassName});
      }

      return (<span class={`${dotClassName} ${prefixCls}-dot-spin`}>
          <i class={`${prefixCls}-dot-item`}/>
          <i class={`${prefixCls}-dot-item`}/>
          <i class={`${prefixCls}-dot-item`}/>
          <i class={`${prefixCls}-dot-item`}/>
        </span>);
    };
    onMounted(() => {
      updateSpinning();
    });
    onUpdated(() => {
      nextTick(() => {
        debouncifyUpdateSpinning();
        updateSpinning();
      });
    });
    onBeforeUnmount(() => {
      cancelExistingSpin();
    });

    return {
      sSpinning,
      debouncifyUpdateSpinning,
      updateSpinning,
      cancelExistingSpin,
      getChildren,
      renderIndicator,
      configProvider: useConfigProvider()
    };
  },
  render(ctx) {
    const instance = getCurrentInstance();
    const {
      size,
      prefixCls: customizePrefixCls,
      tip,
      wrapperClassName,
      ...restProps
    } = ctx.$props;
    const getPrefixCls = ctx.configProvider.getPrefixCls;
    const prefixCls = getPrefixCls('spin', customizePrefixCls);

    const {sSpinning} = ctx;
    const spinClassName = {
      [prefixCls]: true,
      [`${prefixCls}-sm`]: size === 'small',
      [`${prefixCls}-lg`]: size === 'large',
      [`${prefixCls}-spinning`]: sSpinning,
      [`${prefixCls}-show-text`]: !!tip
    };

    const spinElement = (
        <div {...restProps} class={spinClassName}>
          {ctx.renderIndicator(prefixCls)}
          {tip ? <div class={`${prefixCls}-text`}>{tip}</div> : null}
        </div>
    );
    const children = ctx.getChildren();
    if (children) {
      const containerClassName = {
        [`${prefixCls}-container`]: true,
        [`${prefixCls}-blur`]: sSpinning
      };

      return (
          <div
              {...getListenersFromInstance(instance)}
              class={[`${prefixCls}-nested-loading`, wrapperClassName]}>
            {sSpinning && <div key="loading">{spinElement}</div>}
            <div class={containerClassName} key="container">
              {children}
            </div>
          </div>
      );
    }
    return spinElement;
  }
}) as any;
