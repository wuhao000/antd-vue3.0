import classNames from 'classnames';
import {defineComponent, getCurrentInstance, h, ref} from 'vue';
import {getComponentFromProp, getOptionProps} from '../_util/props-util';
import PropTypes from '../_util/vue-types';
import Icon from '../icon';
import DataEntryFocus from './data-entry-focus';
import Input from './input';
import inputProps from './inputProps';

const ActionMap = {
  onClick: 'click',
  onHover: 'mouseover'
};

export default defineComponent({
  name: 'AInputPassword',
  inheritAttrs: false,
  setup(props) {
    const visible = ref(false);
    const {blur, setEl, focus} = DataEntryFocus();
    const onVisibleChange = () => {
      if (props.disabled) {
        return;
      }
      visible.value = !visible.value;
    };
    const getIcon = () => {
      const {prefixCls, action} = props;
      const iconTrigger = ActionMap[action] || 'onClick';
      const iconProps = {
        type: visible.value ? 'eye' : 'eye-invisible',
        [iconTrigger]: onVisibleChange,
        onMousedown: e => {
          // Prevent focused state lost
          // https://github.com/ant-design/ant-design/issues/15173
          e.preventDefault();
        },
        class: `${prefixCls}-icon`,
        key: 'passwordIcon'
      };
      return <Icon {...iconProps}/>;
    };
    return {visible, setEl, blur, focus, getIcon};
  },
  props: {
    ...inputProps,
    prefixCls: PropTypes.string.def('ant-input-password'),
    inputPrefixCls: PropTypes.string.def('ant-input'),
    action: PropTypes.string.def('click'),
    visibilityToggle: PropTypes.bool.def(true)
  },
  render(ctx) {
    const instance = getCurrentInstance();
    const {
      prefixCls,
      inputPrefixCls,
      size,
      suffix,
      visibilityToggle,
      ...restProps
    } = getOptionProps(instance);
    const suffixIcon = visibilityToggle && this.getIcon();
    const componentInstance = getCurrentInstance();
    const inputClassName = classNames(prefixCls, {
      [`${prefixCls}-${size}`]: !!size
    });
    const inputProps = {
      ...restProps,
      ...this.$attrs,
      prefixCls: inputPrefixCls,
      size,
      suffix: suffixIcon,
      prefix: getComponentFromProp(componentInstance, 'prefix'),
      addonAfter: getComponentFromProp(componentInstance, 'addonAfter'),
      addonBefore: getComponentFromProp(componentInstance, 'addonBefore'),
      type: this.visible ? 'text' : 'password',
      class: inputClassName,
      ref: ctx.setEl
    };
    return <Input {...inputProps}/>;
  }
});
