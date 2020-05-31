import {defineComponent, getCurrentInstance, isVNode, VNode} from 'vue';
import {getComponentFromProp, getListenersFromInstance, getPropsData} from '../_util/props-util';
import {cloneElement} from '../_util/vnode';
import PropTypes from '../_util/vue-types';
import {useConfigProvider} from '../config-provider';
import Icon from '../icon';
import RcDropdown from '../vc-dropdown/src/index';
import DropdownButton from './dropdown-button';
import getDropdownProps from './get-dropdown-props';

const DropdownProps = getDropdownProps();
const Dropdown = defineComponent({
  name: 'ADropdown',
  props: {
    ...DropdownProps,
    prefixCls: PropTypes.string,
    mouseEnterDelay: PropTypes.number.def(0.15),
    mouseLeaveDelay: PropTypes.number.def(0.1),
    placement: DropdownProps.placement.def('bottomLeft')
  },
  setup($props) {
    const instance = getCurrentInstance();
    const getTransitionName = () => {
      const {placement = '', transitionName} = $props;
      if (transitionName !== undefined) {
        return transitionName;
      }
      if (placement.indexOf('top') >= 0) {
        return 'slide-down';
      }
      return 'slide-up';
    };
    const handleOverlayNode = (node: VNode, prefixCls: any) => {
      if (!node) {
        return undefined;
      }
      // menu cannot be selectable in dropdown defaultly
      // menu should be focusable in dropdown defaultly
      const overlayProps = getPropsData(node);
      if (!(typeof node.type === 'object' && node.type['name'] === 'AMenu')) {
        return cloneElement(node);
      }
      const {selectable = false, focusable = true} = overlayProps || {};
      const expandIcon = (
          <span class={`${prefixCls}-menu-submenu-arrow`}>
            <Icon type="right" class={`${prefixCls}-menu-submenu-arrow-icon`}/>
          </span>
      );
      return node && isVNode(node)
          ? cloneElement(node, {
            mode: 'vertical',
            selectable,
            focusable,
            expandIcon
          })
          : node;
    };
    const renderOverlay = (prefixCls) => {
      const overlay = getComponentFromProp(instance, 'overlay');
      if (Array.isArray(overlay)) {
        return handleOverlayNode(overlay[0], prefixCls);
      } else {
        return overlay.map(node => handleOverlayNode(node, prefixCls));
      }
    };
    return {
      getTransitionName,
      renderOverlay,
      configProvider: useConfigProvider()
    };
  },
  render(ctx) {
    const instance = getCurrentInstance();
    const {$slots} = ctx;
    const props = this.$props;
    const {prefixCls: customizePrefixCls, trigger, disabled, getPopupContainer} = props;
    const {getPopupContainer: getContextPopupContainer} = this.configProvider;
    const getPrefixCls = this.configProvider.getPrefixCls;
    const prefixCls = getPrefixCls('dropdown', customizePrefixCls);

    const dropdownTrigger = $slots.default({
      class: `${prefixCls}-trigger`,
      disabled
    });
    const triggerActions = disabled ? [] : trigger;
    let alignPoint;
    if (triggerActions && triggerActions.indexOf('contextmenu') !== -1) {
      alignPoint = true;
    }
    const dropdownProps = {
      alignPoint,
      ...props,
      prefixCls,
      getPopupContainer: getPopupContainer || getContextPopupContainer,
      transitionName: this.getTransitionName(),
      trigger: triggerActions,
      ...getListenersFromInstance(instance)
    };
    return (
        <RcDropdown {...dropdownProps}>
          {dropdownTrigger}
          <template slot="overlay">{this.renderOverlay(prefixCls)}</template>
        </RcDropdown>
    );
  }
}) as any;

Dropdown.Button = DropdownButton;
export default Dropdown;
export {DropdownProps};
