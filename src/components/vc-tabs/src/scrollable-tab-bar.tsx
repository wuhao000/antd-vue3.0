import {getListenersFromInstance} from '@/components/_util/props-util';
import {useRefs} from './save-ref';
import {getCurrentInstance} from 'vue';
import ScrollableTabBarNode from './scrollable-tab-bar-node';
import TabBarRootNode from './tab-bar-root-node';
import TabBarTabsNode from './tab-bar-tabs-node';

export default (props) => {
  const listeners = getListenersFromInstance(getCurrentInstance());
  const {getRef, saveRef} = useRefs();
  return (
      <TabBarRootNode saveRef={saveRef} {...{props, ...listeners}}>
        <ScrollableTabBarNode saveRef={saveRef} getRef={getRef} {...{...props, ...listeners}}>
          <TabBarTabsNode saveRef={saveRef} {...{...props, ...listeners}} />
        </ScrollableTabBarNode>
      </TabBarRootNode>
  );
};
