import classNames from 'classnames';
import {defineComponent, ref, getCurrentInstance} from 'vue';
import {getListeners, getOptionProps} from '../_util/props-util';
import PropTypes from '../_util/vue-types';
import {useConfigProvider} from '../config-provider';
import VcCheckbox from '../vc-checkbox';
import {useRadioGroupContext} from './group';

function noop() {
}

export default defineComponent({
  name: 'ARadio',
  props: {
    prefixCls: PropTypes.string,
    defaultChecked: Boolean,
    checked: {type: Boolean, default: undefined},
    disabled: Boolean,
    isGroup: Boolean,
    value: PropTypes.any,
    name: String,
    id: String,
    autoFocus: Boolean,
    type: PropTypes.string.def('radio')
  },
  setup(props, {emit}) {
    const checkboxRef = ref(null);
    const focus = () => {
      checkboxRef.value?.focus();
    };
    const blur = () => {
      checkboxRef.value?.blur();
    };
    const handleChange = (event) => {
      const targetChecked = event.target.checked;
      emit('update:value', targetChecked);
      emit('change', event);
    };
    const radioGroup = useRadioGroupContext();
    const onChange = (e) => {
      emit('change', e);
      if (radioGroup && radioGroup.onRadioChange) {
        radioGroup.onRadioChange(e);
      }
    };
    const setCheckbox = (el) => {
      checkboxRef.value = el;
    };
    const {getPrefixCls} = useConfigProvider();
    return {getPrefixCls, radioGroup, setCheckbox, focus, blur, handleChange, onChange};
  },
  render(ctx) {
    const currentInstance = getCurrentInstance();
    const {$slots} = this;
    const radioGroup = ctx.radioGroup;
    const props = getOptionProps(currentInstance);
    const children = $slots.default && $slots.default();
    const {mouseenter = noop, mouseleave = noop} = getListeners(this);
    const {prefixCls: customizePrefixCls, ...restProps} = props;
    const prefixCls = ctx.getPrefixCls('radio', customizePrefixCls);

    const radioProps = {
      ...restProps,
      prefixCls,
      ...this.$attrs
    };

    if (radioGroup) {
      radioProps.name = radioGroup.name;
      radioProps.onChange = this.onChange;
      radioProps.checked = props.value === radioGroup.getValue();
      radioProps.disabled = props.disabled || radioGroup.disabled;
    } else {
      radioProps.onChange = this.handleChange;
    }
    const wrapperClassString = classNames({
      [`${prefixCls}-wrapper`]: true,
      [`${prefixCls}-wrapper-checked`]: radioProps.checked,
      [`${prefixCls}-wrapper-disabled`]: radioProps.disabled
    });

    return (
      <label class={wrapperClassString} onMouseenter={mouseenter} onMouseleave={mouseleave}>
        <VcCheckbox {...radioProps} ref={ctx.setCheckbox}/>
        {children !== undefined ? <span>{children}</span> : null}
      </label>
    );
  }
}) as any;
