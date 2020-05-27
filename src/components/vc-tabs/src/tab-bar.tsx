import {useRefs} from '@/components/vc-tabs/src/save-ref';
import {defineComponent} from 'vue';
import TabBarRootNode from './tab-bar-root-node';
import TabBarTabsNode from './tab-bar-tabs-node';

export default defineComponent({
  name: 'TabBar',
  inheritAttrs: false,
  setup() {
    const {getRef, saveRef} = useRefs();
    return {getRef, saveRef};
  },
  render(ctx) {
    const {getRef, saveRef} = ctx;
    return <TabBarRootNode getRef={getRef} saveRef={saveRef} {...ctx.$attrs}>
      <TabBarTabsNode getRef={getRef} saveRef={saveRef} {...ctx.$attrs} />
    </TabBarRootNode>;
  }
});
