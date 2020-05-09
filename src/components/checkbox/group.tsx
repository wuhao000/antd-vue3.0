import {defineComponent, inject, provide, ref, watch, Ref} from 'vue';
import hasProp from '../_util/props-util';
import PropTypes from '../_util/vue-types';
import {ConfigConsumerProps, IConfigProvider} from '../config-provider';
import Checkbox from './checkbox';

function noop() {
}

export interface CheckboxGroupContext {
  registerValue?: (value) => void;
  cancelValue?: (value) => void;
  toggleOption?: (option) => void;
  name?: string;
  sValue?: Ref;
  disabled?: boolean;
}

export default defineComponent({
  name: 'ACheckboxGroup',
  model: {
    prop: 'value'
  },
  props: {
    name: PropTypes.string,
    prefixCls: PropTypes.string,
    defaultValue: PropTypes.array,
    value: PropTypes.array,
    options: PropTypes.array.def([]),
    disabled: PropTypes.bool
  },
  setup(props, {emit, slots}) {
    const sValue = ref(props.value || props.defaultValue || []);
    const registeredValues = ref([]);
    const configProvider: IConfigProvider = inject('configProvider') || ConfigConsumerProps;
    watch(() => props.value, (val) => {
      sValue.value = val || [];
    });
    const getOptions = () => {
      const {options} = props;
      return options.map(option => {
        if (typeof option === 'string') {
          return {
            label: option,
            value: option
          };
        }
        let label = option.label;
        if (label === undefined && slots.label) {
          label = slots.label(option);
        }
        return {...option, label};
      });
    };
    const cancelValue = (value) => {
      registeredValues.value = registeredValues.value.filter(val => val !== value);
    };

    const registerValue = (value) => {
      registeredValues.value = [...registeredValues.value, value];
    };
    const toggleOption = (option) => {
      const optionIndex = sValue.value.indexOf(option.value);
      const value = [...sValue.value];
      if (optionIndex === -1) {
        value.push(option.value);
      } else {
        value.splice(optionIndex, 1);
      }
      if (props.value === undefined) {
        sValue.value = value;
      }
      const options = getOptions();
      const val = value
          .filter(val => registeredValues.value.indexOf(val) !== -1)
          .sort((a, b) => {
            const indexA = options.findIndex(opt => opt.value === a);
            const indexB = options.findIndex(opt => opt.value === b);
            return indexA - indexB;
          });
      emit('update:value', val);
      emit('change', val);
    };
    provide('checkboxGroupContext', {
      registerValue,
      cancelValue,
      toggleOption,
      name: props.name,
      sValue,
      disabled: props.disabled
    } as CheckboxGroupContext);
    return {configProvider, sValue, getOptions, cancelValue, registerValue, toggleOption};
  },
  render() {
    const {$props: props, $slots} = this;
    const {prefixCls: customizePrefixCls, options} = props;
    const getPrefixCls = this.configProvider.getPrefixCls;
    const prefixCls = getPrefixCls('checkbox', customizePrefixCls);

    let children = $slots.default;
    const groupPrefixCls = `${prefixCls}-group`;
    if (options && options.length > 0) {
      children = this.getOptions().map(option => (
          <Checkbox
              prefixCls={prefixCls}
              key={option.value.toString()}
              disabled={'disabled' in option ? option.disabled : props.disabled}
              indeterminate={option.indeterminate}
              value={option.value}
              checked={this.sValue.indexOf(option.value) !== -1}
              onChange={option.onChange || noop}
              class={`${groupPrefixCls}-item`}
          >
            {option.label}
          </Checkbox>
      ));
    }
    return <div class={groupPrefixCls}>{children}</div>;
  }
});
