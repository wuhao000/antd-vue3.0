import {KeyName} from '@/components/_util/keycode';
import {useBaseInput} from '@/tools/base-input';
import {defineComponent, getCurrentInstance, h, inject, nextTick, onMounted, ref, watch} from 'vue';
import PropTypes from '../_util/vue-types';
import {ConfigConsumerProps, IConfigProvider} from '../config-provider';
import ClearableLabeledInput from './ClearableLabeledInput';
import {fixControlledValue, resolveOnChange} from './input';
import inputProps from './inputProps';
import ResizableTextArea from './ResizableTextArea';

const TextAreaProps = {
  ...inputProps,
  autosize: PropTypes.oneOfType([Object, Boolean]),
  autoSize: PropTypes.oneOfType([Object, Boolean])
};

export default defineComponent({
  name: 'ATextarea',
  inheritAttrs: false,
  props: {
    ...TextAreaProps
  },
  setup(props, {emit, attrs}) {
    const configProvider: IConfigProvider = inject('configProvider') || ConfigConsumerProps;
    const stateValue = ref(typeof props.value === 'undefined' ? props.defaultValue : props.value);
    let resizableTextAreaRef = null;
    onMounted(() => {
      nextTick(() => {
        if (props.autoFocus) {
          focus();
        }
      });
    });
    watch(() => props.value, (val) => {
      stateValue.value = val;
    });
    const setValue = (value: string, callback) => {
      if (props.value === undefined) {
        stateValue.value = value;
        nextTick(() => {
          callback && callback();
        });
      }
    };
    const {_emit} = useBaseInput();
    const handleKeyDown = (e) => {
      if (e.key === KeyName.Enter) {
        _emit('pressEnter', e);
      }
      _emit('keydown', e);
    };
    const onChange = (e) => {
      _emit('update:value', stateValue.value);
      _emit('change', e, stateValue.value);
    };
    const focus = () => {
      resizableTextAreaRef?.$refs.textArea?.focus();
    };
    const blur = () => {
      resizableTextAreaRef?.$refs.textArea?.blur();
    };
    const handleChange = (e) => {
      const {value, composing} = e.target;
      if (composing || stateValue.value === value) {
        return;
      }
      setValue(e.target.value, () => {
        resizableTextAreaRef?.resizeTextarea();
      });
      resolveOnChange(resizableTextAreaRef?.$refs.textArea, e, onChange);
    };
    const handleReset = (e) => {
      setValue('', () => {
        resizableTextAreaRef?.renderTextArea();
        focus();
      });
      resolveOnChange(resizableTextAreaRef?.$refs.textArea, e, onChange);
    };
    const renderTextArea = (prefixCls) => {
      const resizeProps = {
        ...props,
        prefixCls,
        onInput: handleChange,
        onKeydown: handleKeyDown,
        ...attrs,
        value: stateValue.value
      };
      return <ResizableTextArea {...resizeProps} ref={(el) => resizableTextAreaRef = el}/>;
    };
    return {configProvider, handleReset, renderTextArea, stateValue, focus, blur};
  },
  render() {
    const {stateValue, prefixCls: customizePrefixCls} = this;
    const getPrefixCls = this.configProvider.getPrefixCls;
    const prefixCls = getPrefixCls('input', customizePrefixCls);

    const props = {
      ...this.$props,
      ...this.$attrs,
      prefixCls,
      inputType: 'text',
      value: fixControlledValue(stateValue),
      element: this.renderTextArea(prefixCls),
      handleReset: this.handleReset
    };
    return <ClearableLabeledInput {...props}/>;
  }
}) as any;
