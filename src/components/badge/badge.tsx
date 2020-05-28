import {CSSOptions} from '@vue/cli-service/types/ProjectOptions';
import classNames from 'classnames';
import {defineComponent, ref, getCurrentInstance, Transition} from 'vue';
import {PresetColorTypes} from '../_util/colors';
import getTransitionProps from '../_util/getTransitionProps';
import isNumeric from '../_util/isNumeric';
import {filterEmpty, getComponentFromProp, getListenersFromInstance, initDefaultProps} from '../_util/props-util';
import {cloneElement} from '../_util/vnode';
import PropTypes from '../_util/vue-types';
import {useConfigProvider} from '../config-provider';
import ScrollNumber from './scroll-number';

const BadgeProps = {
  /** Number to show in badge */
  count: PropTypes.any,
  showZero: PropTypes.bool,
  /** Max count to show */
  overflowCount: PropTypes.number,
  /** whether to show red dot without number */
  dot: PropTypes.bool,
  prefixCls: PropTypes.string,
  scrollNumberPrefixCls: PropTypes.string,
  status: PropTypes.oneOf(['success', 'processing', 'default', 'error', 'warning']),
  color: PropTypes.string,
  text: PropTypes.string,
  offset: PropTypes.array,
  numberStyle: PropTypes.object.def(() => ({})),
  title: PropTypes.string
};
function isPresetColor(color) {
  return PresetColorTypes.indexOf(color) !== -1;
}
export default defineComponent({
  name: 'ABadge',
  props: initDefaultProps(BadgeProps, {
    showZero: false,
    dot: false,
    overflowCount: 99
  }),
  setup(props, {emit, slots}) {
    const badgeCount = ref(undefined);
    const getNumberedDispayCount = () => {
      const {overflowCount} = props;
      const count = badgeCount.value;
      return count > overflowCount ? `${overflowCount}+` : count;
    };
    const isZero = () => {
      const numberedDispayCount = getNumberedDispayCount();
      return numberedDispayCount === '0' || numberedDispayCount === 0;
    };
    const isDot = () => {
      const {dot} = props;
      return (dot && !isZero()) || hasStatus();
    };

    const getDispayCount = () => {
      // dot mode don't need count
      if (isDot()) {
        return '';
      }
      return getNumberedDispayCount();
    };
    const getScrollNumberTitle = () => {
      const {title} = props;
      const count = badgeCount.value;
      if (title) {
        return title;
      }
      return typeof count === 'string' || typeof count === 'number' ? count : undefined;
    };
    const getStyleWithOffset = () => {
      const {offset, numberStyle} = props;
      return offset
          ? {
            right: `${-parseInt(offset[0], 10)}px`,
            marginTop: isNumeric(offset[1]) ? `${offset[1]}px` : offset[1],
            ...numberStyle
          }
          : {...numberStyle};
    };
    const hasStatus = () => {
      const {status, color} = props;
      return !!status || !!color;
    };
    const getBadgeClassName = (prefixCls) => {
      const children = filterEmpty(slots.default);
      const hasStatusValue = hasStatus();
      return classNames(prefixCls, {
        [`${prefixCls}-status`]: hasStatusValue,
        [`${prefixCls}-dot-status`]: hasStatusValue && props.dot && !isZero(),
        [`${prefixCls}-not-a-wrapper`]: !children.length
      });
    };


    const isHidden = () => {
      const {showZero} = props;
      const displayCount = getDispayCount();
      const isEmpty = displayCount === null || displayCount === undefined || displayCount === '';
      return (isEmpty || (isZero() && !showZero)) && !isDot();
    };
    const renderStatusText = (prefixCls) => {
      const {text} = props;
      const hidden = isHidden();
      return hidden || !text ? null : <span class={`${prefixCls}-status-text`}>{text}</span>;
    };
    const renderDispayComponent = () => {
      const count = badgeCount.value;
      const customNode = count;
      if (!customNode || typeof customNode !== 'object') {
        return undefined;
      }
      return cloneElement(customNode, {
        style: getStyleWithOffset()
      });
    };
    const renderBadgeNumber = (prefixCls, scrollNumberPrefixCls) => {
      const {status, color} = props;
      const count = badgeCount.value;
      const displayCount = getDispayCount();
      const isDotV = isDot();
      const hidden = isHidden();

      const scrollNumberCls = {
        [`${prefixCls}-dot`]: isDotV,
        [`${prefixCls}-count`]: !isDotV,
        [`${prefixCls}-multiple-words`]:
        !isDotV && count && count.toString && count.toString().length > 1,
        [`${prefixCls}-status-${status}`]: !!status,
        [`${prefixCls}-status-${color}`]: isPresetColor(color)
      };

      let statusStyle = getStyleWithOffset();
      if (color && !isPresetColor(color)) {
        statusStyle = statusStyle || {};
        statusStyle.background = color;
      }

      return hidden ? null : (
          <ScrollNumber
              prefixCls={scrollNumberPrefixCls}
              data-show={!hidden}
              v-show={!hidden}
              className={scrollNumberCls}
              count={displayCount}
              displayComponent={renderDispayComponent()} // <Badge status="success" count={<Icon type="xxx" />}></Badge>
              title={getScrollNumberTitle()}
              style={statusStyle}
              key="scrollNumber"
          />
      );
    };


    return {
      setBadgeCount(value) {
        badgeCount.value = value;
      },
      getNumberedDispayCount,
      getDispayCount,
      getScrollNumberTitle,
      getStyleWithOffset,
      getBadgeClassName,
      hasStatus,
      isZero,
      isDot,
      isHidden,
      renderStatusText,
      renderDispayComponent,
      renderBadgeNumber,
      configProvider: useConfigProvider()
    };
  },
  render(ctx) {
    const instance = getCurrentInstance();
    const {
      prefixCls: customizePrefixCls,
      scrollNumberPrefixCls: customizeScrollNumberPrefixCls,
      status,
      text,
      color,
      $slots
    } = this;

    const getPrefixCls = this.configProvider.getPrefixCls;
    const prefixCls = getPrefixCls('badge', customizePrefixCls);
    const scrollNumberPrefixCls = getPrefixCls('scroll-number', customizeScrollNumberPrefixCls);

    const children = filterEmpty($slots.default);
    let count = getComponentFromProp(instance, 'count');
    if (Array.isArray(count)) {
      count = count[0];
    }
    ctx.setBadgeCount(count);
    const scrollNumber = this.renderBadgeNumber(prefixCls, scrollNumberPrefixCls);
    const statusText = this.renderStatusText(prefixCls);
    const statusCls = classNames({
      [`${prefixCls}-status-dot`]: this.hasStatus(),
      [`${prefixCls}-status-${status}`]: !!status,
      [`${prefixCls}-status-${color}`]: isPresetColor(color)
    });
    const statusStyle: any = {};
    if (color && !isPresetColor(color)) {
      statusStyle.background = color;
    }
    // <Badge status="success" />
    if (!children.length && this.hasStatus()) {
      const styleWithOffset = this.getStyleWithOffset();
      const statusTextColor = styleWithOffset && styleWithOffset.color;
      return (
          <span
              {...getListenersFromInstance(instance)}
              class={this.getBadgeClassName(prefixCls)}
              style={styleWithOffset}
          >
          <span class={statusCls} style={statusStyle}/>
          <span style={{color: statusTextColor}} class={`${prefixCls}-status-text`}>
            {text}
          </span>
        </span>
      );
    }

    const transitionProps = getTransitionProps(children.length ? `${prefixCls}-zoom` : '');

    return (
        <span {...getListenersFromInstance(instance)} class={this.getBadgeClassName(prefixCls)}>
        {children}
          <Transition {...transitionProps}>{scrollNumber}</Transition>
          {statusText}
      </span>
    );
  }
}) as any;
