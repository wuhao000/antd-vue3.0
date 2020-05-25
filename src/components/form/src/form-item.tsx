import {addListener} from '@/components/_util/vnode';
import AsyncValidator, {RuleItem, Rules} from 'async-validator';
import debounce from 'lodash.debounce';
import {computed, defineComponent, getCurrentInstance, onBeforeUnmount, onMounted, provide, ref} from 'vue';
import BaseFormItem from './base-form-item';
import {useForm, useFormContext} from './form';
import {getPropByPath, noop, ProvideKeys} from './utils';

export interface FormItemContext {
  registerControl: (control) => any;
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
    const currentHelp = ref('');
    const validateDisabled = ref(true);
    const controls = ref([]);
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
      controls.value?.[0].focus();
    };
    const getFilteredRule = (trigger) => {
      const rules = getRules();
      return rules.filter(rule => {
        rule.asyncValidator;
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
      console.log(controls.value[0]);
      if (controls.value.length === 1) {
        return controls.value[0].ctx.value;
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
    const onFieldBlur = () => {
      console.log('blur');
      validate('blur');
    };
    const onFieldChange = () => {
      console.log('change');
      if (validateDisabled.value) {
        validateDisabled.value = false;
        return;
      }
      validateLocal('change');
    };
    const validate = (trigger, callback = noop) => {
      validateDisabled.value = false;
      const rules = getFilteredRule(trigger);
      if ((!rules || rules.length === 0) && props.required !== true) {
        callback();
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
          currentHelp.value = errors ? errors[0].message : '';
          callback(currentHelp.value, invalidFields);
          emit('validate', !errors, errors);
          resolve({errors, label});
          // formContext.emit('validate', props.prop, !errors, currentHelp.value || null);
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
      registerControl: (control) => {
        const rules = getRules();
        if (rules.length || props.required !== undefined) {
          addListener(control, 'onBlur', onFieldBlur);
          addListener(control, 'onChange', onFieldChange);
        }
        if (!controls.value.includes(control)) {
          controls.value.push(control);
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
      currentHelp,
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
    props.help = props.help || ctx.currentHelp;
    props.labelCol = ctx.getLabelCol();
    props.validateStatus = props.validateStatus || ctx.currentValidateStatus;
    props.wrapperCol = ctx.getWrapperCol();
    return <BaseFormItem {...props}>
      {this.$slots.default && this.$slots.default()}
    </BaseFormItem>;
  }
});
