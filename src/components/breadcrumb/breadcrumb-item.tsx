import {defineComponent} from 'vue';
import {getComponentFromContext} from '../_util/props-util';
import PropTypes from '../_util/vue-types';
import {useConfigProvider} from '../config-provider';
import DropDown from '../dropdown/dropdown';
import Icon from '../icon';

export default defineComponent({
  name: 'ABreadcrumbItem',
  props: {
    prefixCls: PropTypes.string,
    href: PropTypes.string,
    separator: PropTypes.any.def('/'),
    overlay: PropTypes.any
  },
  setup($props, {slots}) {
    const renderBreadcrumbNode = (breadcrumbItem, prefixCls) => {
      const overlay = getComponentFromContext({$props, $slots: slots}, 'overlay');
      if (overlay) {
        return (
            <DropDown overlay={overlay} placement="bottomCenter">
              <span class={`${prefixCls}-overlay-link`}>
                {breadcrumbItem}
                <Icon type="down"/>
              </span>
            </DropDown>
        );
      }
      return breadcrumbItem;
    };
    return {
      renderBreadcrumbNode,
      configProvider: useConfigProvider()
    };
  },
  render() {
    const {prefixCls: customizePrefixCls, $slots} = this;
    const getPrefixCls = this.configProvider.getPrefixCls;
    const prefixCls = getPrefixCls('breadcrumb', customizePrefixCls);
    const separator = getComponentFromContext(this, 'separator');
    const children = $slots.default;
    let link;
    if (this.href !== undefined) {
      link = <a class={`${prefixCls}-link`}>{children}</a>;
    } else {
      link = <span class={`${prefixCls}-link`}>{children}</span>;
    }
    // wrap to dropDown
    link = this.renderBreadcrumbNode(link, prefixCls);
    if (children) {
      return (
          <span>
            {link}
            {separator && separator !== '' && (
                <span class={`${prefixCls}-separator`}>{separator}</span>
            )}
          </span>
      );
    }
    return null;
  }
}) as any;
