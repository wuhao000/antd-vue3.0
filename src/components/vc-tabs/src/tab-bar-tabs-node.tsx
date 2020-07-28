import {defineComponent, getCurrentInstance} from 'vue';
import {getComponentFromProp, getOptionProps} from '../../_util/props-util';
import PropTypes from '../../_util/vue-types';
import {isVertical} from './utils';

function noop() {
}

export default defineComponent({
  name: 'TabBarTabsNode',
  inheritAttrs: false,
  props: {
    activeKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    panels: PropTypes.any.def([]),
    prefixCls: PropTypes.string.def(''),
    tabBarGutter: PropTypes.any.def(null),
    onTabClick: PropTypes.func,
    saveRef: PropTypes.func.def(noop),
    getRef: PropTypes.func.def(noop),
    renderTabBarNode: PropTypes.func,
    tabBarPosition: PropTypes.string,
    direction: PropTypes.string
  },
  render(ctx) {
    const {
      panels: children,
      activeKey,
      prefixCls,
      tabBarGutter,
      saveRef,
      tabBarPosition,
      direction
    } = ctx.$props;
    const rst = [];
    const instance = getCurrentInstance();
    const renderTabBarNode = getComponentFromProp(instance, 'renderTabBarNode');
    children.forEach((child, index) => {
      if (!child) {
        return;
      }
      const props = getOptionProps(child);
      const key = child.key;
      let cls = activeKey === key ? `${prefixCls}-tab-active` : '';
      cls += ` ${prefixCls}-tab`;
      const events: any = {};
      const disabled = props.disabled || props.disabled === '';
      if (disabled) {
        cls += ` ${prefixCls}-tab-disabled`;
      } else {
        events.onClick = () => {
          ctx.$emit('tabClick', key);
        };
      }
      const tab = getComponentFromProp(child, 'tab');
      let gutter = tabBarGutter && index === children.length - 1 ? 0 : tabBarGutter;
      gutter = typeof gutter === 'number' ? `${gutter}px` : gutter;
      const marginProperty = direction === 'rtl' ? 'marginLeft' : 'marginRight';
      const style = {
        [isVertical(tabBarPosition) ? 'marginBottom' : marginProperty]: gutter
      };
      // warning(tab !== undefined, 'There must be `tab` property or slot on children of Tabs.');
      let node: any = (
          <div
              role="tab"
              aria-disabled={disabled ? 'true' : 'false'}
              aria-selected={activeKey === key ? 'true' : 'false'}
              {...events}
              class={cls}
              key={key}
              style={style}
              ref={activeKey === key ? saveRef('activeTab') : null}>
            {tab}
          </div>
      );
      if (renderTabBarNode && Array.isArray(renderTabBarNode) && renderTabBarNode.length > 0) {
        node = renderTabBarNode;
      }
      rst.push(node);
    });
    return (
        <div ref={ctx.saveRef('navTabsContainer')}>
          {rst}
        </div>
    );
  }
}) as any;
