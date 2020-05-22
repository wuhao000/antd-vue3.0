import {useLocalValue} from '@/tools/value';
import classNames from 'classnames';
import {getCurrentInstance, defineComponent} from 'vue';
import {getListenersFromInstance, getOptionProps, initDefaultProps} from '../_util/props-util';
import PropTypes from '../_util/vue-types';
import Base from '../base';
import {useConfigProvider} from '../config-provider';
import Icon from '../icon';
import VcInputNumber from '../vc-input-number/src';
import { useRef } from '@/tools/ref';

export const InputNumberProps = {
  prefixCls: PropTypes.string,
  min: PropTypes.number,
  max: PropTypes.number,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  step: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  defaultValue: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  tabIndex: PropTypes.number,
  disabled: PropTypes.bool,
  size: PropTypes.oneOf(['large', 'small', 'default']),
  formatter: PropTypes.func,
  parser: PropTypes.func,
  decimalSeparator: PropTypes.string,
  placeholder: PropTypes.string,
  name: PropTypes.string,
  id: PropTypes.string,
  precision: PropTypes.number,
  autoFocus: PropTypes.bool
};

const InputNumber = defineComponent({
  name: 'AInputNumber',
  inheritAttrs: false,
  model: {
    prop: 'value',
    event: 'change'
  },
  props: initDefaultProps(InputNumberProps, {
    step: 1
  }),
  setup(props, {emit}) {
    const {ref: inputRef, setRef: setInputRef} = useRef();
    const {setValue} = useLocalValue(props.defaultValue);
    const focus = () => {
      inputRef.value.focus();
    };
    const blur = () => {
      inputRef.value.blur();
    };
    const onChange = (value) => {
      setValue(value);
      emit('change', value)
    }
    return {
      setInputRef, focus, blur, onChange,
      configProvider: useConfigProvider()
    };
  },
  render(ctx) {
    const instance = getCurrentInstance();
    const {prefixCls: customizePrefixCls, size, ...others} = getOptionProps(instance);
    const getPrefixCls = ctx.configProvider.getPrefixCls;
    const prefixCls = getPrefixCls('input-number', customizePrefixCls);

    const inputNumberClass = classNames({
      [`${prefixCls}-lg`]: size === 'large',
      [`${prefixCls}-sm`]: size === 'small'
    });
    const upIcon = <Icon type="up" class={`${prefixCls}-handler-up-inner`}/>;
    const downIcon = <Icon type="down" class={`${prefixCls}-handler-down-inner`}/>;

    const vcInputNumberprops = {
      prefixCls,
      upHandler: upIcon,
      downHandler: downIcon,
      ...others,
      class: inputNumberClass,
      ref: ctx.setInputRef,
      ...getListenersFromInstance(instance),
      onChange: ctx.onChange
    };
    return <VcInputNumber {...vcInputNumberprops} />;
  }
}) as any;

/* istanbul ignore next */
InputNumber.install = function(Vue) {
  Vue.use(Base);
  Vue.component(InputNumber.name, InputNumber);
};

export default InputNumber;
