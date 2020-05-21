import classNames from 'classnames';
import {getCurrentInstance} from 'vue';
import {getListenersFromInstance, getOptionProps, initDefaultProps} from '../_util/props-util';
import PropTypes from '../_util/vue-types';
import Base from '../base';
import {useConfigProvider} from '../config-provider';
import Icon from '../icon';
import VcInputNumber from '../vc-input-number/src';

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

const InputNumber = {
  name: 'AInputNumber',
  model: {
    prop: 'value',
    event: 'change'
  },
  props: initDefaultProps(InputNumberProps, {
    step: 1
  }),
  methods: {
    focus() {
      this.$refs.inputNumberRef.focus();
    },
    blur() {
      this.$refs.inputNumberRef.blur();
    }
  },
  setup() {
    return {
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
      ref: 'inputNumberRef',
      ...getListenersFromInstance(instance)
    };
    return <VcInputNumber {...vcInputNumberprops} />;
  }
};

/* istanbul ignore next */
InputNumber.install = function(Vue) {
  Vue.use(Base);
  Vue.component(InputNumber.name, InputNumber);
};

export default InputNumber;
