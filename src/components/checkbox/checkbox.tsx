import {CheckboxGroupContext} from '@/components/checkbox/Group';
import {useForm} from '@/components/form/src/form';
import classNames from 'classnames';
import {defineComponent, getCurrentInstance, inject, nextTick, onBeforeUnmount, onMounted, watch} from 'vue';
import {getOptionProps} from '../_util/props-util';
import PropTypes from '../_util/vue-types';
import warning from '../_util/warning';
import {ConfigConsumerProps, IConfigProvider} from '../config-provider';
import DataEntryFocus from '../input/data-entry-focus';
import VcCheckbox from '../vc-checkbox';

function noop() {
}

export default defineComponent({
  name: 'ACheckbox',
  inheritAttrs: false,
  __ANT_CHECKBOX: true,
  props: {
    prefixCls: PropTypes.string,
    defaultChecked: PropTypes.bool,
    checked: PropTypes.bool,
    disabled: PropTypes.bool,
    isGroup: PropTypes.bool,
    value: PropTypes.any,
    name: PropTypes.string,
    id: PropTypes.string,
    indeterminate: PropTypes.bool,
    type: PropTypes.string.def('checkbox'),
    autoFocus: PropTypes.bool
  },
  setup(props, {emit}) {
    useForm().registerControl();
    const checkboxGroupContext: CheckboxGroupContext = inject('checkboxGroupContext');
    watch(() => props.value, (value, prevValue) => {
      nextTick(() => {
        if (checkboxGroupContext.registerValue && checkboxGroupContext.cancelValue) {
          checkboxGroupContext.cancelValue(prevValue);
          checkboxGroupContext.registerValue(value);
        }
      });
    });
    onMounted(() => {
      if (checkboxGroupContext?.registerValue) {
        checkboxGroupContext.registerValue(props.value);
      }
      warning(
          props.checked !== undefined || checkboxGroupContext || props.value == undefined,
          'Checkbox',
          '`value` is not validate prop, do you mean `checked`?'
      );
    });
    onBeforeUnmount(() => {
      if (checkboxGroupContext?.cancelValue) {
        checkboxGroupContext.cancelValue(props.value);
      }
    });
    const handleChange = (event) => {
      const targetChecked = event.target.checked;
      emit('update:value', targetChecked);
      emit('change', event);
    };
    const configProvider: IConfigProvider = inject('configProvider') || ConfigConsumerProps;
    const {getEl, blur, focus, setEl} = DataEntryFocus();
    return {getEl, handleChange, setEl, checkboxGroupContext, blur, focus, configProvider};
  },
  render(ctx) {
    const componentInstance = getCurrentInstance();
    const props = getOptionProps(componentInstance);
    const children = this.$slots.default && this.$slots.default();
    const {mouseenter = noop, mouseleave = noop} = componentInstance.attrs;
    const {prefixCls: customizePrefixCls, indeterminate, ...restProps} = props;
    const getPrefixCls = this.configProvider.getPrefixCls;
    const prefixCls = getPrefixCls('checkbox', customizePrefixCls);

    const checkboxProps = {
      ...restProps,
      ...ctx.$attrs,
      prefixCls
    };
    if (ctx.checkboxGroupContext) {
      checkboxProps.onChange = (...args) => {
        this.$emit('change', ...args);
        ctx.checkboxGroupContext.toggleOption({label: children, value: props.value});
      };
      checkboxProps.name = ctx.checkboxGroupContext.name;
      checkboxProps.checked = ctx.checkboxGroupContext.sValue.indexOf(props.value) !== -1;
      checkboxProps.disabled = props.disabled || ctx.checkboxGroupContext.disabled;
      checkboxProps.indeterminate = indeterminate;
    } else {
      checkboxProps.onChange = this.handleChange;
    }
    const classString = classNames({
      [`${prefixCls}-wrapper`]: true,
      [`${prefixCls}-wrapper-checked`]: checkboxProps.checked,
      [`${prefixCls}-wrapper-disabled`]: checkboxProps.disabled
    });
    const checkboxClass = classNames({
      [`${prefixCls}-indeterminate`]: indeterminate
    });
    return (
        // @ts-ignore
        <label class={classString} onMouseenter={mouseenter} onMouseleave={mouseleave}>
          <VcCheckbox {...checkboxProps} class={checkboxClass} ref="vcCheckbox"/>
          {children !== undefined && <span>{children}</span>}
        </label>
    );
  }
}) as any;
