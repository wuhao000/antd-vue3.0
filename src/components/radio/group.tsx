import classNames from 'classnames';
import {computed, defineComponent, inject, nextTick, provide, ref, Ref, watch, getCurrentInstance} from 'vue';
import {filterEmpty, getListeners, getOptionProps} from '../_util/props-util';
import PropTypes from '../_util/vue-types';
import {useConfigProvider} from '../config-provider';
import Radio from './radio';

function noop() {
}

export interface RadioGroupContext {
  onRadioChange: (...args) => any;
  getValue: () => any;
  name: string;
  disabled: boolean;
}

export const useRadioGroupContext = () => inject('radioGroupContext') as RadioGroupContext;

const Props = {
  prefixCls: PropTypes.string,
  defaultValue: PropTypes.any,
  value: PropTypes.any,
  size: {
    default: 'default',
    validator(value: string) {
      return ['large', 'default', 'small'].includes(value);
    }
  },
  options: {
    default: () => [],
    type: Array
  },
  disabled: Boolean,
  name: String,
  buttonStyle: PropTypes.string.def('outline')
};
export default defineComponent({
  name: 'ARadioGroup',
  props: Props,
  setup(props, {emit, attrs}) {
    const {value, defaultValue} = props;
    const {getPrefixCls} = useConfigProvider();
    const updatingValue = ref(false);
    const stateValue = ref(value === undefined ? defaultValue : value);
    const radioOptions = computed(() => {
      const {disabled} = props;
      return props.options.map(option => {
        return typeof option === 'string'
          ? {label: option, value: option}
          : {...option, disabled: option.disabled === undefined ? disabled : option.disabled};
      });
    });
    watch(() => props.value, (val) => {
      updatingValue.value = false;
      stateValue.value = val;
    });
    const classes = computed(() => {
      const {prefixCls, size} = props;
      return {
        [`${prefixCls}`]: true,
        [`${prefixCls}-${size}`]: size
      };
    });
    const onRadioChange = (ev) => {
      const lastValue = stateValue.value;
      const value = ev.target.value;
      if (props.value === undefined) {
        stateValue.value = value;
      }
      // nextTick for https://github.com/vueComponent/ant-design-vue/issues/1280
      if (!updatingValue.value && value !== lastValue) {
        updatingValue.value = true;
        emit('update:value', value);
        emit('change', ev);
      }
      nextTick(() => {
        updatingValue.value = false;
      });
    };
    provide('radioGroupContext', {
      getValue: () => stateValue.value,
      onRadioChange,
      name: props.name,
      disabled: props.disabled
    } as RadioGroupContext);
    return {
      classes,
      radioOptions,
      stateValue,
      getPrefixCls,
      updatingValue,
      onRadioChange
    };
  },
  render(ctx) {
    const currentInstance = getCurrentInstance();
    const {mouseenter = noop, mouseleave = noop} = getListeners(currentInstance);
    const props = getOptionProps(currentInstance);
    const {prefixCls: customizePrefixCls, options, buttonStyle} = props;
    const prefixCls = ctx.getPrefixCls('radio', customizePrefixCls);

    const groupPrefixCls = `${prefixCls}-group`;
    const classString = classNames(groupPrefixCls, `${groupPrefixCls}-${buttonStyle}`, {
      [`${groupPrefixCls}-${props.size}`]: props.size
    });

    let children = filterEmpty(this.$slots.default);

    // 如果存在 options, 优先使用
    if (options && options.length > 0) {
      children = options.map(option => {
        if (typeof option === 'string') {
          return (
            <Radio
              key={option}
              prefixCls={prefixCls}
              disabled={props.disabled}
              value={option}
              checked={this.stateValue === option}
            >
              {option}
            </Radio>
          );
        } else {
          return (
            <Radio
              key={`radio-group-value-options-${option.value}`}
              prefixCls={prefixCls}
              disabled={option.disabled || props.disabled}
              value={option.value}
              checked={this.stateValue === option.value}
            >
              {option.label}
            </Radio>
          );
        }
      });
    }

    return (
      <div class={classString} onMouseenter={mouseenter} onMouseleave={mouseleave}>
        {children}
      </div>
    );
  }
});
