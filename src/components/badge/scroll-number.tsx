import classNames from 'classnames';
import omit from 'omit.js';
import {CSSProperties, defineComponent, getCurrentInstance, onBeforeUnmount, onUpdated, ref, watch} from 'vue';
import {getStyleFromInstance} from '../_util/props-util';
import {cloneElement} from '../_util/vnode';
import PropTypes from '../_util/vue-types';
import {useConfigProvider} from '../config-provider';

function getNumberArray(num) {
  return num
      ? num
          .toString()
          .split('')
          .reverse()
          .map(i => {
            const current = Number(i);
            return isNaN(current) ? i : current;
          })
      : [];
}

const ScrollNumberProps = {
  prefixCls: PropTypes.string,
  count: PropTypes.any,
  component: PropTypes.string,
  title: PropTypes.oneOfType([PropTypes.number, PropTypes.string, null]),
  displayComponent: PropTypes.any,
  className: PropTypes.object
};

export default defineComponent({
  props: ScrollNumberProps,
  setup(props, {emit}) {
    const animateStarted = ref(true);
    const sCount = ref(props.count);
    const lastCount = ref(undefined);
    const timeout = ref(undefined);
    watch(() => props.count, () => {
      lastCount.value = sCount.value;
      animateStarted.value = true;
    });
    onUpdated(() => {
      const {count} = props;
      if (animateStarted.value) {
        clearTimeout();
        // Let browser has time to reset the scroller before actually
        // performing the transition.
        timeout.value = setTimeout(() => {
          animateStarted.value = false;
          sCount.value = count;
          onAnimated();
        });
      }
    });
    const getPositionByNum = (num, i) => {
      const currentCount = Math.abs(Number(sCount.value));
      const lastCountV = Math.abs(Number(lastCount.value));
      const currentDigit = Math.abs(getNumberArray(sCount.value)[i]);
      const lastDigit = Math.abs(getNumberArray(lastCountV)[i]);

      if (animateStarted.value) {
        return 10 + num;
      }
      // 同方向则在同一侧切换数字
      if (currentCount > lastCountV) {
        if (currentDigit >= lastDigit) {
          return 10 + num;
        }
        return 20 + num;
      }
      if (currentDigit <= lastDigit) {
        return 10 + num;
      }
      return num;
    };
    const onAnimated = () => {
      emit('animated');
    };
    const renderNumberList = (position, className) => {
      const childrenToReturn = [];
      for (let i = 0; i < 30; i++) {
        childrenToReturn.push(
            <p key={i.toString()}
               class={classNames(className, {
                 current: position === i
               })}>
              {i % 10}
            </p>
        );
      }

      return childrenToReturn;
    };
    const renderCurrentNumber = (prefixCls, num, i) => {
      if (typeof num === 'number') {
        const position = getPositionByNum(num, i);
        const removeTransition =
            animateStarted.value || getNumberArray(lastCount)[i] === undefined;
        const style = {
          transition: removeTransition ? 'none' : undefined,
          msTransform: `translateY(${-position * 100}%)`,
          WebkitTransform: `translateY(${-position * 100}%)`,
          transform: `translateY(${-position * 100}%)`
        };
        return (
            <span class={`${prefixCls}-only`} style={style} key={i}>
            {renderNumberList(position, `${prefixCls}-only-unit`)}
          </span>
        );
      }
      return (
          <span key="symbol" class={`${prefixCls}-symbol`}>
          {num}
        </span>
      );
    };

    const renderNumberElement = (prefixCls) => {
      const count = sCount.value;
      if (count && Number(count) % 1 === 0) {
        return getNumberArray(count)
            .map((num, i) => renderCurrentNumber(prefixCls, num, i))
            .reverse();
      }
      return count;
    };
    const clearTimeout = () => {
      if (timeout.value) {
        window.clearTimeout(timeout.value);
        timeout.value = undefined;
      }
    };
    onBeforeUnmount(() => {
      clearTimeout();
    });
    return {
      getPositionByNum,
      renderNumberElement,
      renderCurrentNumber,
      configProvider: useConfigProvider()
    };
  },


  render() {
    const instance = getCurrentInstance();
    const {
      prefixCls: customizePrefixCls,
      title,
      component: Tag = 'sup',
      displayComponent,
      className
    } = this;
    const getPrefixCls = this.configProvider.getPrefixCls;
    const prefixCls = getPrefixCls('scroll-number', customizePrefixCls);
    if (displayComponent) {
      return cloneElement(displayComponent, {
        class: `${prefixCls}-custom-component`
      });
    }
    const style: CSSProperties = getStyleFromInstance(instance);
    // fix https://fb.me/react-unknown-prop
    const restProps = omit(this.$props,
        ['count', 'component', 'prefixCls', 'className', 'displayComponent']);
    const newProps = {
      ...restProps,
      title,
      style,
      class: classNames(prefixCls, className)
    };
    // allow specify the border
    // mock border-color by box-shadow for compatible with old usage:
    // <Badge count={4} style={{ backgroundColor: '#fff', color: '#999', borderColor: '#d9d9d9' }} />
    if (style && style.borderColor) {
      newProps.style.boxShadow = `0 0 0 1px ${style.borderColor} inset`;
    }
    return <Tag {...newProps}>{this.renderNumberElement(prefixCls)}</Tag>;
  }
}) as any;
