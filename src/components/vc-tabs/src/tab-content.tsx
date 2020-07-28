import {defineComponent} from 'vue';
import {cloneElement} from '../../_util/vnode';
import PropTypes from '../../_util/vue-types';
import {getActiveIndex, getMarginStyle, getTransformByIndex, getTransformPropValue} from './utils';

export default defineComponent({
  name: 'TabContent',
  props: {
    animated: {type: Boolean, default: true},
    animatedWithMargin: {type: Boolean, default: true},
    prefixCls: {
      default: 'ant-tabs',
      type: String
    },
    activeKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    tabBarPosition: String,
    direction: PropTypes.string,
    destroyInactiveTabPane: PropTypes.bool
  },
  setup(props, {slots}) {
    const getClasses = () => {
      const {animated, prefixCls} = props;
      return {
        [`${prefixCls}-content`]: true,
        [animated ? `${prefixCls}-content-animated` : `${prefixCls}-content-no-animated`]: true
      };
    };
    const getTabPanes = () => {
      const activeKey = props.activeKey;
      const children = (slots.default && slots.default()) || [];
      const newChildren = [];
      children.forEach(child => {
        if (!child) {
          return;
        }
        const key = child.key;
        const active = activeKey === key;
        newChildren.push(
            cloneElement(child, {
              active,
              destroyInactiveTabPane: props.destroyInactiveTabPane,
              rootPrefixCls: props.prefixCls
            })
        );
      });
      return newChildren;
    };


    return {
      getTabPanes, getClasses
    };
  },
  render() {
    const {activeKey, tabBarPosition, animated, animatedWithMargin, direction, getClasses} = this;
    let style = {};
    if (animated && this.$slots.default) {
      const activeIndex = getActiveIndex(this.$slots.default(), activeKey);
      if (activeIndex !== -1) {
        const animatedStyle = animatedWithMargin
            ? getMarginStyle(activeIndex, tabBarPosition)
            : getTransformPropValue(getTransformByIndex(activeIndex, tabBarPosition, direction));
        style = animatedStyle;
      } else {
        style = {
          display: 'none'
        };
      }
    }
    return (
        <div class={getClasses()} style={style}>
          {this.getTabPanes()}
        </div>
    );
  }
}) as any;
