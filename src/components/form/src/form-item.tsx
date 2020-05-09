import {useEmitter} from '@/mixins/emitter';
import AsyncValidator, {ValidateRule, ValidateRules} from 'async-validator';
import debounce from 'lodash.debounce';
import {computed, defineComponent, getCurrentInstance, inject, nextTick, onBeforeUnmount, provide, ref} from 'vue';
import BaseFormItem from './base-form-item';
import {getPropByPath, noop} from './utils';

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
    const currentValidateStatus = ref('');
    const currentHelp = ref('');
    const validateDisabled = ref(true);
    const control = ref(null);
    const formContext: any = inject('form');
    const {dispatch, broadcast} = useEmitter(getCurrentInstance());
    provide('formItem', {});
    const labelStyle = computed(() => {
      const labelWidth = props.labelWidth ? props.labelWidth : (formContext?.labelWidth);
      const style: any = {};
      if (labelWidth) {
        style.width = typeof labelWidth === 'number' ? (labelWidth + 'px') : labelWidth;
        style.float = 'left';
      }
      return style;
    });
    onBeforeUnmount(() => {
      if (props.prop) {
        dispatch('DForm', 'd.form.removeField', [this]);
      }
    });
    const focus = () => {
      if (control.value?.focus.bind(control.value)) {
        control.value?.focus();
      }
    };
    const getFilteredRule = (trigger) => {
      const rules = getRules();
      return rules.filter(rule => {
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
    const fieldValue = computed(() => {
      if (props.value !== null && props.value !== undefined) {
        return props.value;
      }
      const model = formContext?.model;
      if (!model || !props.prop) {
        return;
      }
      let path = props.prop;
      if (path.indexOf(':') !== -1) {
        path = path.replace(/:/, '.');
      }
      return getPropByPath(model, path, true).v;
    });
    const getRules = (): ValidateRule[] => {
      let formRules: ValidateRules = formContext?.rules;
      const selfRules = props.rules;
      const requiredRule = props.required !== undefined ? {required: props.required} : [];
      const prop = getPropByPath(formRules, props.prop || '');
      formRules = formRules ? (prop.o[props.prop || ''] || prop.v) : [];
      return [].concat(selfRules || formRules || []).concat(requiredRule);
    };
    const onFieldBlur = () => {
      validate('blur');
    };
    const onFieldChange = () => {
      if (validateDisabled.value) {
        validateDisabled.value = false;
        return;
      }
      validate('change');
    };
    const validate = debounce((trigger, callback = noop) => {
      nextTick(() => {
        validateDisabled.value = false;
        const rules = getFilteredRule(trigger);
        if ((!rules || rules.length === 0) && props.required === undefined) {
          callback();
          return true;
        }
        currentValidateStatus.value = 'validating';
        const descriptor = {};
        if (rules && rules.length > 0) {
          rules.forEach(rule => {
            delete rule.trigger;
          });
        }
        descriptor[props.prop] = rules;
        const validator = new AsyncValidator(descriptor);
        const model = {
          [props.prop]: fieldValue
        };
        validator.validate(model, {firstFields: true}, (errors, invalidFields) => {
          currentValidateStatus.value = !errors ? 'success' : 'error';
          currentHelp.value = errors ? errors[0].message : '';
          callback(currentHelp.value, invalidFields);
          emit('validate', !errors, errors);
          formContext.emit('validate', props.prop, !errors, currentHelp.value || null);
        });
      });
    }, 300);
    if (props.prop) {
      dispatch('DForm', 'd.form.addField', [this]);
      this.$on('d.form-item.setControl', (c) => {
        control.value = c;
      });
      const rules = this.getRules();
      if (rules.length || this.required !== undefined) {
        this.$on('d.form.blur', onFieldBlur);
        this.$on('el.form.blur', onFieldBlur);
        this.$on('d.form.change', onFieldChange);
        this.$on('el.form.change', onFieldChange);
      }
    }
    const wrapperStyle = () => {
      const labelWidth = this.labelWidth ? this.labelWidth : (this.form && this.form.labelWidth);
      const style: any = {};
      if (labelWidth) {
        style.marginLeft = typeof labelWidth === 'number' ? (labelWidth + 'px') : labelWidth;
      }
      return style;
    };
    return {
      fieldValue,
      wrapperStyle,
      isRequired: computed(() => {
        if (props.required) {
          return props.required;
        } else {
          return getRules().some(it => it.required);
        }
      }),
      labelCol: computed(() => {
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
      }),
      wrapperCol: computed(() => {
        let wrapperCol: any = {};
        if (attrs['wrapper-col']) {
          wrapperCol = attrs['wrapper-col'];
        }
        if (formContext?.wrapperCol) {
          if (typeof formContext.wrapperCol === 'number') {
            wrapperCol.span = formContext.wrapperCol;
          } else {
            wrapperCol = formContext?.wrapperCol;
          }
        } else if (formContext?.labelCol) {
          if (typeof formContext?.labelCol === 'number') {
            wrapperCol.span = 24 - formContext.labelCol;
          }
        }
        wrapperCol.style = wrapperStyle;
        return wrapperCol;
      }),
      focus,
      labelStyle
    };
  },
  render() {
    const props = {...this.$props, ...this.$attrs};
    if (this.$slots.label) {
      props.label = this.$slots.label;
    }
    props.help = this.help || this.currentHelp;
    props.labelCol = this.labelCol;
    props.validateStatus = this.validateStatus || this.currentValidateStatus;
    props.wrapperCol = this.wrapperCol;
    return <BaseFormItem {...props}>
      {this.$slots.default()}
    </BaseFormItem>;
  }
});
