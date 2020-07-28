import {defineComponent} from 'vue';
import {getComponentFromContext} from '../_util/props-util';
import PropTypes from '../_util/vue-types';
import Button from '../button';
import {ButtonGroupProps} from '../button/button-group';
import buttonTypes from '../button/buttonTypes';
import {useConfigProvider} from '../config-provider';
import Icon from '../icon';
import Dropdown from './dropdown';
import getDropdownProps from './get-dropdown-props';

const ButtonTypesProps = buttonTypes();
const DropdownProps = getDropdownProps();
const ButtonGroup = Button.Group;
const DropdownButtonProps = {
  ...ButtonGroupProps,
  ...DropdownProps,
  type: PropTypes.oneOf(['primary', 'ghost', 'dashed', 'danger', 'default']).def('default'),
  size: PropTypes.oneOf(['small', 'large', 'default']).def('default'),
  htmlType: ButtonTypesProps.htmlType,
  href: PropTypes.string,
  disabled: PropTypes.bool,
  prefixCls: PropTypes.string,
  placement: DropdownProps.placement.def('bottomRight'),
  icon: PropTypes.any,
  title: PropTypes.string
};
export {DropdownButtonProps};
export default defineComponent({
  name: 'ADropdownButton',
  model: {
    prop: 'visible',
    event: 'visibleChange'
  },
  props: DropdownButtonProps,
  setup($props, {emit}) {
    const onClick = (e) => {
      emit('click', e);
    };
    const onVisibleChange = (val) => {
      emit('visibleChange', val);
    };
    return {
      onClick,
      onVisibleChange,
      configProvider: useConfigProvider()
    };
  },
  render() {
    const {
      type,
      disabled,
      htmlType,
      prefixCls: customizePrefixCls,
      trigger,
      align,
      visible,
      placement,
      getPopupContainer,
      href,
      title,
      ...restProps
    } = this.$props;
    const icon = getComponentFromContext(this, 'icon') || <Icon type="ellipsis"/>;
    const {getPopupContainer: getContextPopupContainer} = this.configProvider;
    const getPrefixCls = this.configProvider.getPrefixCls;
    const prefixCls = getPrefixCls('dropdown-button', customizePrefixCls);
    const dropdownProps: any = {
      align,
      disabled,
      trigger: disabled ? [] : trigger,
      placement,
      getPopupContainer: getPopupContainer || getContextPopupContainer,
      onVisibleChange: this.onVisibleChange
    };
    if (this.visible === undefined) {
      dropdownProps.visible = visible;
    }

    const buttonGroupProps = {
      ...restProps,
      class: prefixCls
    };

    return (
        <ButtonGroup {...buttonGroupProps}>
          <Button
              type={type}
              disabled={disabled}
              onClick={this.onClick}
              htmlType={htmlType}
              href={href}
              title={title}>
            {this.$slots.default && this.$slots.default()}
          </Button>
          <Dropdown {...dropdownProps}>
            <template slot="overlay">{getComponentFromContext(this, 'overlay')}</template>
            <Button disabled={disabled} type={type}>{icon}</Button>
          </Dropdown>
        </ButtonGroup>
    );
  }
});
