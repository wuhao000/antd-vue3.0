import {useLocalValue} from '@/tools/value';
import {ComponentInternalInstance} from '@vue/runtime-core';
import AsyncValidator, {RuleItem, Rules} from 'async-validator';
import debounce from 'lodash.debounce';
import {computed, defineComponent, getCurrentInstance, onBeforeUnmount, onMounted, provide, ref} from 'vue';
import BaseFormItem from './base-form-item';
import {useForm, useFormContext} from './form';
import {getPropByPath, noop, ProvideKeys} from './utils';

export interface FormItemContext {
  registerControl: (control) => any;
  emit: (event: string, ...args: any[]) => any;
}

export default defineComponent({
  name: 'AFormItem',
  componentName: 'ElFormItem',
  props: {
    hasFeedback: {type: Boolean, default: false},
    prop: {type: String, default: ''},
    labelWidth: {type: [String, Number]},
    value: {},
    required: {type: Boolean, default: false},
    rules: {type: [Object, Array]},
    label: {type: String, default: ''},
    validateStatus: {type: String},
    help: {type: String}
  },
  setup(props, {attrs, emit}) {
    const form = useForm();
    const currentValidateStatus = ref('');
    const {value: help, setValue: setHelp} = useLocalValue('', 'help');
    const validateDisabled = ref(true);
    const controls = [];
    const formContext = useFormContext();
    const labelStyle = computed(() => {
      const labelWidth = props.labelWidth ? props.labelWidth : (formContext?.labelWidth);
      const style: any = {};
      if (labelWidth) {
        style.width = typeof labelWidth === 'number' ? (labelWidth + 'px') : labelWidth;
        style.float = 'left';
      }
      return style;
    });

    const focus = () => {
      if (controls.length) {
        controls[0].focus();
      }
    };
    const getFilteredRule = (trigger) => {
      const rules = getRules();
      return rules.filter(rule => {
        if (trigger === null || trigger === undefined || trigger === '') {
          return true;
        }
        if (!rule.trigger || trigger === '') {
          return true;
        }
        if (Array.isArray(rule.trigger)) {
          return rule.trigger.indexOf(trigger) > -1;
        } else {
          return rule.trigger === trigger;
        }
      }).map(rule => Object.assign({}, rule));
    };
    const getFieldValue = () => {
      if (props.value !== null && props.value !== undefined) {
        return props.value;
      }
      if (controls.length === 1) {
        return controls[0].ctx.value;
      }
    };
    const getRules = (): RuleItem[] => {
      let formRules: Rules = formContext?.rules;
      const selfRules = props.rules;
      const requiredRule = props.required !== undefined ? {required: props.required} : [];
      const prop = getPropByPath(formRules, props.prop || '');
      formRules = formRules ? (prop.o[props.prop || ''] || prop.v) : [];
      return [].concat(selfRules || formRules || []).concat(requiredRule);
    };
    const onFieldBlur = (...args: any[]) => {
      validate('blur', noop, true);
    };
    const onFieldChange = (...args: any[]) => {
      if (validateDisabled.value) {
        validateDisabled.value = false;
        return;
      }
      validateLocal('change', noop, true);
    };
    const validate = (trigger, callback = noop, collect: boolean = false) => {
      validateDisabled.value = false;
      const rules = getFilteredRule(trigger);
      if ((!rules || rules.length === 0) && props.required !== true) {
        callback();
        setHelp('');
        currentValidateStatus.value = '';
        return true;
      }
      currentValidateStatus.value = 'validating';
      const descriptor = {};
      const prop = props.prop || 'value';
      descriptor[prop] = rules;
      const validator = new AsyncValidator(descriptor);
      const model = {
        [prop]: getFieldValue()
      };
      const label = props.label;
      return new Promise((resolve, reject) => {
        validator.validate(model, {firstFields: true}, (errors, invalidFields) => {
          currentValidateStatus.value = !errors ? 'success' : 'error';
          const currentError = errors ? errors[0].message : '';
          setHelp(currentError);
          callback(currentError, invalidFields);
          emit('validate', !errors, errors);
          resolve({errors, label});
          formContext.collect();
        });
      });
    };
    const validateLocal = debounce(validate);
    const wrapperStyle = () => {
      const labelWidth = props.labelWidth ? props.labelWidth : (form && form.labelWidth);
      const style: any = {};
      if (labelWidth) {
        style.marginLeft = typeof labelWidth === 'number' ? (labelWidth + 'px') : labelWidth;
      }
      return style;
    };
    provide(ProvideKeys.FormItemContext, {
      registerControl: (control: ComponentInternalInstance) => {
        if (!controls.includes(control)) {
          controls.push(control);
        }
      },
      emit: (e: string, ...args: any[]) => {
        const rules = getRules();
        if (rules.length || props.required !== undefined) {
          if (e === 'blur') {
            onFieldBlur(...args);
          }
          if (e === 'change') {
            onFieldChange(...args);
          }
        }
      }
    });
    const instance = getCurrentInstance();
    onMounted(() => {
      form.registerField(instance);
    });
    onBeforeUnmount(() => {
      form.unRegisterField(instance);
    });
    return {
      getFieldValue,
      wrapperStyle,
      isRequired: computed(() => {
        if (props.required) {
          return props.required;
        } else {
          return getRules().some(it => it.required);
        }
      }),
      getLabelCol() {
        let labelCol: any = {};
        if (attrs['label-col']) {
          labelCol = attrs['label-col'];
        }
        if (formContext?.labelCol) {
          if (typeof formContext.labelCol === 'number') {
            labelCol.span = formContext.labelCol;
          } else {
            labelCol = formContext.labelCol;
          }
        }
        labelCol.style = labelStyle;
        return labelCol;
      },
      getWrapperCol() {
        let wrapperCol: any = {};
        if (attrs['wrapper-col']) {
          wrapperCol = attrs['wrapper-col'];
        }
        if (formContext.wrapperCol) {
          if (typeof formContext.wrapperCol === 'number') {
            wrapperCol.span = formContext.wrapperCol;
          } else {
            wrapperCol = formContext?.wrapperCol;
          }
        } else if (formContext.labelCol) {
          if (typeof formContext.labelCol === 'number') {
            wrapperCol.span = 24 - formContext.labelCol;
          } else if (typeof formContext.labelCol === 'object'
              && typeof formContext.labelCol.span === 'number') {
            wrapperCol.span = 24 - formContext.labelCol.span;
          }
        }
        wrapperCol.style = wrapperStyle;
        return wrapperCol;
      },
      focus,
      currentValidateStatus,
      labelStyle,
      help,
      controls,
      validate
    };
  },
  render(ctx) {
    const props: any = {
      ...this.$props,
      ...this.$attrs,
      controls: ctx.controls
    };
    if (this.$slots.label) {
      props.label = this.$slots.label;
    }
    props.help = props.help || ctx.help;
    props.labelCol = ctx.getLabelCol();
    props.validateStatus = props.validateStatus || ctx.currentValidateStatus;
    props.wrapperCol = ctx.getWrapperCol();
    return <BaseFormItem {...props}>
      {this.$slots.default && this.$slots.default()}
    </BaseFormItem>;
  }
});
