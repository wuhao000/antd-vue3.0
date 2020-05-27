import {defineComponent} from 'vue';
import InkTabBarNode from './ink-tab-bar-node';
import {useRefs} from './save-ref';
import TabBarRootNode from './tab-bar-root-node';
import TabBarTabsNode from './tab-bar-tabs-node';

function noop() {
}

export default defineComponent({
  name: 'InkTabBar',
  setup() {
    const {saveRef, getRef} = useRefs();
    return {saveRef, getRef};
  },
  render(context) {
    const {props, listeners = {}} = context;
    const {saveRef, getRef} = context;
    return (
        <TabBarRootNode saveRef={saveRef} {...props}>
          <TabBarTabsNode
              onTabClick={listeners.tabClick || noop}
              saveRef={saveRef}
              {...{props}}
          />
          <InkTabBarNode saveRef={saveRef} getRef={getRef} {...{props}} />
        </TabBarRootNode>
    );
  }
});
