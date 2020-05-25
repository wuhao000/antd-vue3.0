import {useBaseInput} from '@/tools/base-input';
import {useLocalValue} from '@/tools/value';
import classNames from 'classnames';
import {defineComponent, getCurrentInstance, h, inject, nextTick, onBeforeUnmount, onMounted, ref, Ref} from 'vue';
import {getComponentFromProp} from '../_util/props-util';
import {ConfigConsumerProps, IConfigProvider} from '../config-provider';
import ClearableLabeledInput from './ClearableLabeledInput';
import inputProps from './inputProps';
import TextArea from './textarea';

function noop() {
}

export function fixControlledValue(value: Ref<string> | string) {
  if (value === undefined) {
    return '';
  }
  if (typeof value === 'undefined' || value === null) {
    return '';
  }
  if (typeof value === 'string') {
    return value;
  }
  return value.value;
}

export function resolveOnChange(target, event: InputEvent | MouseEvent, onChange) {
  if (onChange) {
    if (event.type === 'click') {
      // click clear icon
      //event = Object.create(e);
      Object.defineProperty(event, 'target', {
        writable: true
      });
      Object.defineProperty(event, 'currentTarget', {
        writable: true
      });
      if (event.target) {
        const originalInputValue = target.value;
        // change target ref value cause e.target.value should be '' when clear input
        target.value = '';
        onChange(event);
        // reset target ref value
        target.value = originalInputValue;
        return;
      }
    }
    onChange(event);
  }
}

export function getInputClassName(prefixCls, size, disabled) {
  return classNames(prefixCls, {
    [`${prefixCls}-sm`]: size === 'small',
    [`${prefixCls}-lg`]: size === 'large',
    [`${prefixCls}-disabled`]: disabled
  });
}

export default defineComponent({
  name: 'AInput',
  inheritAttrs: false,
  props: {
    ...inputProps
  },
  setup(props, {attrs}) {
    const configProvider: IConfigProvider = inject('configProvider') || ConfigConsumerProps;
    const {value: stateValue, setValue} = useLocalValue(props.defaultValue);
    const inputRef = ref(null);
    const {_emit} = useBaseInput();
    onMounted(() => {
      nextTick(() => {
        if (props.autoFocus) {
          focus();
        }
        clearPasswordValueAttribute();
      });
    });
    let removePasswordTimeout = null;
    onBeforeUnmount(() => {
      if (removePasswordTimeout) {
        clearTimeout(removePasswordTimeout);
      }
    });
    const focus = () => {
      inputRef.value?.focus();
    };
    const blur = () => {
      inputRef.value?.blur();
    };
    const select = () => {
      inputRef.value?.select();
    };
    const onChange = (e) => {
      _emit('change', e);
    };
    const handleReset = (e) => {
      setValue('', () => {
        focus();
      });
      resolveOnChange(inputRef.value, e, onChange);
    };
    const renderInput = (prefixCls) => {
      const otherProps = {};
      Object.keys(props).filter(it => [
        'disabled', 'placeholder'
      ].includes(it)).forEach(key => {
        otherProps[key] = props[key];
      });
      let inputProps = {
        value: fixControlledValue(stateValue),
        ...otherProps,
        ...attrs,
        type: props.type,
        onKeydown: handleKeyDown,
        onInput: handleChange,
        onChange: noop,
        class: getInputClassName(prefixCls, props.size, props.disabled),
        ref: (...args) => {
          inputRef.value = args[0];
        },
        key: 'ant-input'
      };
      return <input {...inputProps}/>;
    };
    const handleChange = (e) => {
      const {value, composing} = e.target;
      if (composing) {
        return;
      }
      setValue(value, clearPasswordValueAttribute);
      resolveOnChange(inputRef.value, e, onChange);
    };
    const clearPasswordValueAttribute = () => {
      // https://github.com/ant-design/ant-design/issues/20541
      removePasswordTimeout = setTimeout(() => {
        if (
            inputRef.value &&
            inputRef.value.getAttribute &&
            inputRef.value.getAttribute('type') === 'password' &&
            inputRef.value.hasAttribute('value')
        ) {
          inputRef.value.removeAttribute('value');
        }
      });
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        _emit('pressEnter', e);
      }
      _emit('keydown', e);
    };
    return {
      value: stateValue, handleChange, handleKeyDown, focus, blur, select, configProvider, handleReset, renderInput
    };
  },
  render(ctx) {
    const componentInstance = getCurrentInstance();
    if (ctx.type === 'textarea') {
      const textareaProps = {
        ...this.$props,
        ...this.$attrs,
        onInput: this.handleChange,
        onKeydown: this.handleKeyDown,
        onChange: noop
      };
      return <TextArea {...textareaProps} ref="input"/>;
    }
    const {prefixCls: customizePrefixCls} = this.$props;
    const stateValue = this.value;
    const getPrefixCls = this.configProvider.getPrefixCls;
    const prefixCls = getPrefixCls('input', customizePrefixCls);
    const addonAfter = getComponentFromProp(componentInstance, 'addonAfter');
    const addonBefore = getComponentFromProp(componentInstance, 'addonBefore');
    const suffix = getComponentFromProp(componentInstance, 'suffix');
    const prefix = getComponentFromProp(componentInstance, 'prefix');
    const copyProps = this.$props;
    const props: any = {
      ...componentInstance.attrs,
      placeholder: copyProps.placeholder,
      defaultValue: copyProps.defaultValue,
      allowClear: copyProps.allowClear,
      disabled: copyProps.disabled,
      type: copyProps.type,
      size: copyProps.size,
      className: copyProps.className,
      readOnly: copyProps.readOnly,
      prefixCls,
      value: fixControlledValue(stateValue),
      inputType: 'input',
      element: this.renderInput(prefixCls),
      handleReset: this.handleReset,
      addonAfter,
      addonBefore,
      suffix,
      prefix
    };
    return <ClearableLabeledInput {...props}/>;
  }
}) as any;
