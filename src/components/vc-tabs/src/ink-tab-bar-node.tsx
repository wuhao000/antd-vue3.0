import {ComponentInternalInstance} from '@vue/runtime-core';
import {defineComponent, getCurrentInstance, nextTick, onMounted, onUpdated} from 'vue';
import PropTypes from '../../_util/vue-types';
import {getActiveIndex, getLeft, getStyle, getTop, isTransform3dSupported, setTransform} from './utils';

function componentDidUpdate(component: ComponentInternalInstance, init?) {
  const context = component['ctx'];
  const {getRef, styles = {}, panels, activeKey, direction} = context;
  const rootNode = getRef('root');
  const wrapNode = getRef('nav') || rootNode;
  const inkBarNode = getRef('inkBar');
  const activeTab = getRef('activeTab');
  const inkBarNodeStyle = inkBarNode.style;
  const tabBarPosition = context.tabBarPosition;
  const activeIndex = getActiveIndex(panels, activeKey);
  if (init) {
    // prevent mount animation
    inkBarNodeStyle.display = 'none';
  }
  if (activeTab) {
    const tabNode = activeTab;
    const transformSupported = isTransform3dSupported(inkBarNodeStyle);

    // Reset current style
    setTransform(inkBarNodeStyle, '');
    inkBarNodeStyle.width = '';
    inkBarNodeStyle.height = '';
    inkBarNodeStyle.left = '';
    inkBarNodeStyle.top = '';
    inkBarNodeStyle.bottom = '';
    inkBarNodeStyle.right = '';

    if (tabBarPosition === 'top' || tabBarPosition === 'bottom') {
      let left = getLeft(tabNode, wrapNode);
      let width = tabNode.offsetWidth;
      // If tabNode'width width equal to wrapNode'width when tabBarPosition is top or bottom
      // It means no css working, then ink bar should not have width until css is loaded
      // Fix https://github.com/ant-design/ant-design/issues/7564
      if (width === rootNode.offsetWidth) {
        width = 0;
      } else if (styles.inkBar && styles.inkBar.width !== undefined) {
        width = parseFloat(styles.inkBar.width);
        if (width) {
          left += (tabNode.offsetWidth - width) / 2;
        }
      }
      if (direction === 'rtl') {
        left = getStyle(tabNode, 'margin-left') - left;
      }
      // use 3d gpu to optimize render
      if (transformSupported) {
        setTransform(inkBarNodeStyle, `translate3d(${left}px,0,0)`);
      } else {
        inkBarNodeStyle.left = `${left}px`;
      }
      inkBarNodeStyle.width = `${width}px`;
    } else {
      let top = getTop(tabNode, wrapNode);
      let height = tabNode.offsetHeight;
      if (styles.inkBar && styles.inkBar.height !== undefined) {
        height = parseFloat(styles.inkBar.height);
        if (height) {
          top += (tabNode.offsetHeight - height) / 2;
        }
      }
      if (transformSupported) {
        setTransform(inkBarNodeStyle, `translate3d(0,${top}px,0)`);
        inkBarNodeStyle.top = '0';
      } else {
        inkBarNodeStyle.top = `${top}px`;
      }
      inkBarNodeStyle.height = `${height}px`;
    }
  }
  inkBarNodeStyle.display = activeIndex === -1 ? 'none' : 'block';
}

export default defineComponent({
  name: 'InkTabBarNode',
  inheritAttrs: false,
  props: {
    inkBarAnimated: {
      type: Boolean,
      default: true
    },
    direction: PropTypes.string,
    prefixCls: String,
    styles: Object,
    tabBarPosition: String,
    saveRef: PropTypes.func.def(() => {
    }),
    getRef: PropTypes.func.def(() => {
    }),
    panels: PropTypes.array,
    activeKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  },
  setup() {
    const instance = getCurrentInstance();
    onMounted(() => {
      nextTick(function() {
        componentDidUpdate(instance, true);
      });
    });
    onUpdated(() => {
      nextTick(() => {
        componentDidUpdate(instance);
      });
    });
    return {};
  },
  render() {
    const {prefixCls, styles = {}, inkBarAnimated} = this;
    const className = `${prefixCls}-ink-bar`;
    const classes = {
      [className]: true,
      [inkBarAnimated ? `${className}-animated` : `${className}-no-animated`]: true
    };
    return (
        <div
            style={styles.inkBar}
            class={classes}
            key="inkBar"
            ref={this.saveRef('inkBar')}
        />
    );
  }
}) as any;
