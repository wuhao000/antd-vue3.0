import {defineComponent, getCurrentInstance, onMounted} from 'vue';
import {filterEmpty, getComponentFromProp, getListenersFromInstance, getOptionProps} from '../_util/props-util';
import {isFlexSupported} from '../_util/styleChecker';
import {cloneElement} from '../_util/vnode';
import PropTypes from '../_util/vue-types';
import {useConfigProvider} from '../config-provider';
import Icon from '../icon';
import VcTabs, {TabPane} from '../vc-tabs/src';
import TabContent from '../vc-tabs/src/tab-content';
import TabBar from './tab-bar';

export default defineComponent({
  TabPane,
  name: 'ATabs',
  model: {
    prop: 'activeKey',
    event: 'change'
  },
  props: {
    prefixCls: PropTypes.string,
    activeKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    defaultActiveKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    hideAdd: PropTypes.bool.def(false),
    tabBarStyle: PropTypes.object,
    tabBarExtraContent: PropTypes.any,
    destroyInactiveTabPane: PropTypes.bool.def(false),
    type: PropTypes.oneOf(['line', 'card', 'editable-card']),
    tabPosition: PropTypes.oneOf(['top', 'right', 'bottom', 'left']).def('top'),
    size: PropTypes.oneOf(['default', 'small', 'large']),
    animated: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
    tabBarGutter: PropTypes.number,
    renderTabBar: PropTypes.func
  },
  setup(props, {emit}) {
    const instance = getCurrentInstance();
    const removeTab = (targetKey, e) => {
      e.stopPropagation();
      if (!targetKey) {
        return;
      }
      emit('edit', targetKey, 'remove');
    };
    const createNewTab = (targetKey) => {
      emit('edit', targetKey, 'add');
    };
    const onTabClick = (val) => {
      emit('tabClick', val);
    };
    const onPrevClick = (val) => {
      emit('prevClick', val);
    };
    const onNextClick = (val) => {
      emit('nextClick', val);
    };
    onMounted(() => {
      const NO_FLEX = ' no-flex';
      const tabNode = instance.vnode.el;
      if (tabNode && !isFlexSupported && tabNode.className.indexOf(NO_FLEX) === -1) {
        tabNode.className += NO_FLEX;
      }
    });

    return {
      removeTab,
      createNewTab,
      onTabClick,
      onPrevClick,
      onNextClick,
      configProvider: useConfigProvider()
    };
  },
  render(ctx) {
    const instance = getCurrentInstance();
    const props = getOptionProps(instance);
    const {
      prefixCls: customizePrefixCls,
      size,
      type = 'line',
      tabPosition,
      animated = true,
      hideAdd
    } = props;
    const getPrefixCls = ctx.configProvider.getPrefixCls;
    const prefixCls = getPrefixCls('tabs', customizePrefixCls);
    const children = filterEmpty(this.$slots.default);
    let tabBarExtraContent = getComponentFromProp(instance, 'tabBarExtraContent');
    let tabPaneAnimated = typeof animated === 'object' ? animated.tabPane : animated;

    // card tabs should not have animation
    if (type !== 'line') {
      tabPaneAnimated = 'animated' in props ? tabPaneAnimated : false;
    }
    const cls = {
      [`${prefixCls}-vertical`]: tabPosition === 'left' || tabPosition === 'right',
      [`${prefixCls}-${size}`]: !!size,
      [`${prefixCls}-card`]: type.indexOf('card') >= 0,
      [`${prefixCls}-${type}`]: true,
      [`${prefixCls}-no-animation`]: !tabPaneAnimated
    };
    // only card type tabs can be added and closed
    let childrenWithClose = [];
    if (type === 'editable-card') {
      childrenWithClose = [];
      children.forEach((child, index) => {
        const props = getOptionProps(child);
        let closable = props.closable;
        closable = typeof closable === 'undefined' ? true : closable;
        const closeIcon = closable ? (
            <Icon
                type="close"
                class={`${prefixCls}-close-x`}
                onClick={e => this.removeTab(child.key, e)}
            />
        ) : null;
        childrenWithClose.push(
            cloneElement(child, {
              tab: (
                  <div class={closable ? undefined : `${prefixCls}-tab-unclosable`}>
                    {getComponentFromProp(child, 'tab')}
                    {closeIcon}
                  </div>
              ),
              key: child.key || index
            })
        );
      });
      // Add new tab handler
      if (!hideAdd) {
        tabBarExtraContent = (
            <span>
            <Icon type="plus"
                  class={`${prefixCls}-new-tab`}
                  onClick={this.createNewTab}/>
              {tabBarExtraContent}
          </span>
        );
      }
    }

    tabBarExtraContent = tabBarExtraContent ? (
        <div class={`${prefixCls}-extra-content`}>{tabBarExtraContent}</div>
    ) : null;

    const renderTabBar = getComponentFromProp(instance, 'renderTabBar');
    const listeners = getListenersFromInstance(instance);
    const tabBarProps = {
      ...this.$props,
      prefixCls,
      tabBarExtraContent,
      renderTabBar,
      ...listeners
    };
    const contentCls = {
      [`${prefixCls}-${tabPosition}-content`]: true,
      [`${prefixCls}-card-content`]: type.indexOf('card') >= 0
    };
    const tabsProps = {
      ...getOptionProps(instance),
      prefixCls,
      tabBarPosition: tabPosition,
      // https://github.com/vueComponent/ant-design-vue/issues/2030
      // 如仅传递 tabBarProps 会导致，第二次执行 renderTabBar 时，丢失 on 属性，
      // 添加key之后，会在babel jsx 插件中做一次merge，最终TabBar接收的是一个新的对象，而不是 tabBarProps
      renderTabBar: () => <TabBar key="tabBar" {...tabBarProps} />,
      renderTabContent: () => (
          <TabContent class={contentCls}
                      animated={tabPaneAnimated}
                      animatedWithMargin={true}/>
      ),
      children: childrenWithClose.length > 0 ? childrenWithClose : children,
      __propsSymbol__: Symbol(),
      ...listeners,
      class: cls
    };
    return <VcTabs {...tabsProps} />;
  }
}) as any;
