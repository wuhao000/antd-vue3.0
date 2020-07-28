import {getListenersFromInstance} from '@/components/_util/props-util';
import {useRefs} from './save-ref';
import {defineComponent, getCurrentInstance} from 'vue';
import InkTabBarNode from './ink-tab-bar-node';
import ScrollableTabBarNode from './scrollable-tab-bar-node';
import TabBarRootNode from './tab-bar-root-node';
import TabBarTabsNode from './tab-bar-tabs-node';

export default defineComponent({
  name: 'ScrollableInkTabBar',
  inheritAttrs: false,
  props: [
    'extraContent',
    'inkBarAnimated',
    'tabBarGutter',
    'prefixCls',
    'navWrapper',
    'tabBarPosition',
    'panels',
    'activeKey',
    'prevIcon',
    'nextIcon'
  ],
  setup() {
    const {getRef, saveRef} = useRefs();
    return {getRef, saveRef};
  },
  render(ctx) {
    const instance = getCurrentInstance();
    const props = {...this.$props};
    const listeners = getListenersFromInstance(instance);
    const {default: renderTabBarNode} = this.$slots;
    const {getRef, saveRef} = ctx;
    const rootProps = {...props, ...listeners};
    return (
        <TabBarRootNode
            style={ctx.$attrs.style}
            class={ctx.$attrs.class}
            saveRef={saveRef} {...rootProps}>
          <ScrollableTabBarNode saveRef={saveRef} getRef={getRef} {...{...props, ...listeners}}>
            <TabBarTabsNode
                saveRef={saveRef}
                {...{...props, renderTabBarNode: renderTabBarNode(), ...listeners}}
            />
            <InkTabBarNode saveRef={saveRef} getRef={getRef} {...{...props, ...listeners}} />
          </ScrollableTabBarNode>
        </TabBarRootNode>
    );
  }
});
