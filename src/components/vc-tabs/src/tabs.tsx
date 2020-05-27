import omit from 'omit.js';
import raf from 'raf';
import {defineComponent, getCurrentInstance, inject, onBeforeUnmount, onUpdated, ref, VNode} from 'vue';
import isValid from '../../_util/is-valid';
import {getListenersFromInstance} from '../../_util/props-util';
import {cloneElement} from '../../_util/vnode';
import PropTypes from '../../_util/vue-types';
import KeyCode from './keycode';
import Sentinel from './sentinel';

function getDefaultActiveKey(props) {
  let activeKey = undefined;
  const children = props.children;
  children.forEach(child => {
    if (child && !isValid(activeKey) && !child.disabled) {
      activeKey = child.key;
    }
  });
  return activeKey;
}

function activeKeyIsValid(props, key) {
  const children = props.children;
  const keys = children.map(child => child && child.key);
  return keys.indexOf(key) >= 0;
}

export const useSentinelContext = () => {
  return inject('sentinelContext', {});
};

export default defineComponent({
  name: 'Tabs',
  model: {
    prop: 'activeKey',
    event: 'change'
  },
  props: {
    destroyInactiveTabPane: PropTypes.bool,
    renderTabBar: PropTypes.func.isRequired,
    renderTabContent: PropTypes.func.isRequired,
    navWrapper: PropTypes.func.def(() => (arg => arg)),
    children: PropTypes.any.def(() => []),
    prefixCls: PropTypes.string.def('ant-tabs'),
    tabBarPosition: PropTypes.string.def('top'),
    activeKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    defaultActiveKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    __propsSymbol__: PropTypes.any,
    direction: PropTypes.string.def('ltr'),
    tabBarGutter: PropTypes.number
  },
  setup(props, {emit}) {
    const instance = getCurrentInstance();
    const tabBar = ref<VNode>(undefined);
    const sentinelContext = useSentinelContext();
    const destroy = ref(false);
    const sentinelStart = ref(undefined);
    const sentinelId = ref(undefined);
    const sentinelEnd = ref(undefined);
    const panelSentinelStart = ref(undefined);
    const panelSentinelEnd = ref(undefined);
    const getActiveKey = () => {
      let activeKey;
      if (props.activeKey !== undefined) {
        activeKey = props.activeKey;
      } else if (props.defaultActiveKey !== undefined) {
        activeKey = props.defaultActiveKey;
      } else {
        activeKey = getDefaultActiveKey(props);
      }
      return activeKey;
    };
    const _activeKey = ref(getActiveKey());
    onUpdated(() => {
      if (props.activeKey !== undefined) {
        _activeKey.value = props.activeKey;
      } else if (!activeKeyIsValid(props, _activeKey.value)) {
        // https://github.com/ant-design/ant-design/issues/7093
        _activeKey.value = getDefaultActiveKey(props);
      }
    });
    const onTabClick = (activeKey, e?) => {
      const tabClick = tabBar.value.props.onTabClick;
      if (tabClick) {
        tabClick(activeKey, e);
      }
      setActiveKey(activeKey);
    };
    const onNavKeyDown = (e) => {
      const eventKeyCode = e.keyCode;
      if (eventKeyCode === KeyCode.RIGHT || eventKeyCode === KeyCode.DOWN) {
        e.preventDefault();
        const nextKey = getNextActiveKey(true);
        onTabClick(nextKey);
      } else if (eventKeyCode === KeyCode.LEFT || eventKeyCode === KeyCode.UP) {
        e.preventDefault();
        const previousKey = getNextActiveKey(false);
        onTabClick(previousKey);
      }
    };
    const onScroll = ({target, currentTarget}) => {
      if (target === currentTarget && target.scrollLeft > 0) {
        target.scrollLeft = 0;
      }
    };
    const setSentinelStart = (node) => {
      sentinelStart.value = node;
    };
    const setSentinelEnd = (node) => {
      sentinelEnd.value = node;
    };
    const setPanelSentinelStart = (node) => {
      if (node !== panelSentinelStart.value) {
        updateSentinelContext();
      }
      panelSentinelStart.value = node;
    };
    const setPanelSentinelEnd = (node) => {
      if (node !== panelSentinelEnd.value) {
        updateSentinelContext();
      }
      panelSentinelEnd.value = node;
    };
    const setActiveKey = (activeKey) => {
      if (_activeKey.value !== activeKey) {
        _activeKey.value = activeKey;
        emit('change', activeKey);
      }
    };
    const getNextActiveKey = (next) => {
      const activeKey = _activeKey.value;
      const children = [];
      props.children.forEach(c => {
        if (c && !c.disabled && c.disabled !== '') {
          if (next) {
            children.push(c);
          } else {
            children.unshift(c);
          }
        }
      });
      const length = children.length;
      let ret = length && children[0].key;
      children.forEach((child, i) => {
        if (child.key === activeKey) {
          if (i === length - 1) {
            ret = children[0].key;
          } else {
            ret = children[i + 1].key;
          }
        }
      });
      return ret;
    };
    const updateSentinelContext = () => {
      if (destroy.value) {
        return;
      }

      raf.cancel(sentinelId.value);
      sentinelId.value = raf(() => {
        if (destroy.value) {
          return;
        }
        instance.update();
      });
    };
    onBeforeUnmount(() => {
      destroy.value = true;
      raf.cancel(sentinelId.value);
    });
    const setTabBar = (el) => {
      tabBar.value = el;
    };
    return {
      _activeKey,
      tabBar,
      onTabClick,
      setTabBar,
      onNavKeyDown,
      onScroll,
      setSentinelStart,
      setSentinelEnd,
      setPanelSentinelStart,
      setPanelSentinelEnd,
      setActiveKey,
      getNextActiveKey,
      updateSentinelContext,
      panelSentinelStart,
      panelSentinelEnd,
      sentinelContext
    };
  },
  render(ctx) {
    const instance = getCurrentInstance();
    const props = this.$props;
    const {
      prefixCls,
      navWrapper,
      tabBarPosition,
      renderTabContent,
      renderTabBar,
      destroyInactiveTabPane,
      direction,
      tabBarGutter
    } = props;
    const cls = {
      [prefixCls]: 1,
      [`${prefixCls}-${tabBarPosition}`]: 1,
      [`${prefixCls}-rtl`]: direction === 'rtl'
    };
    ctx.setTabBar(renderTabBar());
    const tabBar = cloneElement(ctx.tabBar, {
      prefixCls,
      navWrapper,
      tabBarPosition,
      panels: props.children,
      activeKey: this._activeKey,
      direction,
      tabBarGutter,
      onKeydown: this.onNavKeyDown,
      onTabClick: this.onTabClick,
      key: 'tabBar'
    });
    const tabContent = cloneElement(renderTabContent(), {
      prefixCls,
      tabBarPosition,
      activeKey: this._activeKey,
      destroyInactiveTabPane,
      direction,
      onChange: this.setActiveKey,
      children: props.children,
      key: 'tabContent'
    });
    const sentinelStart = (
        <Sentinel
            key="sentinelStart"
            setRef={this.setSentinelStart}
            nextElement={this.panelSentinelStart}
        />
    );
    const sentinelEnd = (
        <Sentinel
            key="sentinelEnd"
            setRef={this.setSentinelEnd}
            prevElement={this.panelSentinelEnd}
        />
    );

    const contents = [];

    if (tabBarPosition === 'bottom') {
      contents.push(sentinelStart, tabContent, sentinelEnd, tabBar);
    } else {
      contents.push(tabBar, sentinelStart, tabContent, sentinelEnd);
    }
    const tabsProps = {
      ...omit(getListenersFromInstance(instance), ['change']),
      scroll: this.onScroll,
      class: cls
    };
    return <div {...tabsProps}>{contents}</div>;
  }
}) as any;
