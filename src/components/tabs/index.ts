import Base from '../base';
import TabContent from '../vc-tabs/src/tab-content';
import TabPane from '../vc-tabs/src/tab-pane';
import Tabs from './tabs';

Tabs.TabPane = {...TabPane, name: 'ATabPane', __ANT_TAB_PANE: true};
Tabs.TabContent = {...TabContent, name: 'ATabContent'};

/* istanbul ignore next */
Tabs.install = function(Vue) {
  Vue.use(Base);
  Vue.component(Tabs.name, Tabs);
  Vue.component(Tabs.TabPane.name, Tabs.TabPane);
  Vue.component(Tabs.TabContent.name, Tabs.TabContent);
};

export default Tabs;
export {TabPane, TabContent};
