import {addListener} from '@/components/_util/vnode';
import {useEmitter} from '@/mixins/emitter';
import AsyncValidator, {RuleItem, Rules} from 'async-validator';
import debounce from 'lodash.debounce';
import {
  computed,
  defineComponent,
  getCurrentInstance,
  inject,
  nextTick,
  onBeforeUnmount,
  onMounted,
  provide,
  ref
} from 'vue';
import BaseFormItem from './base-form-item';
import {useForm} from './form';
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
    const formContext: any = inject('form');
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
        rule.asyncValidator
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
      if (model && props.prop) {
        let path = props.prop;
        if (path.indexOf(':') !== -1) {
          path = path.replace(/:/, '.');
        }
        return getPropByPath(model, path, true).v;
      }
      if (controls.value.length === 1) {
        return controls.value[0].ctx.value;
      }
    });
    const getRules = (): RuleItem[] => {
      let formRules: Rules = formContext?.rules;
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
        descriptor[props.prop] = rules;
        const validator = new AsyncValidator(descriptor);
        const model = {
          [props.prop]: fieldValue.value
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
    if (props.prop) {
      onMounted(() => {
        form.registerField(instance);
      });
      onBeforeUnmount(() => {
        form.unRegisterField(instance);
      });
    }
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
      currentValidateStatus,
      labelStyle,
      currentHelp,
      controls
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
    props.labelCol = ctx.labelCol;
    props.validateStatus = props.validateStatus || ctx.currentValidateStatus;
    props.wrapperCol = ctx.wrapperCol;
    return <BaseFormItem {...props}>
      {this.$slots.default && this.$slots.default()}
    </BaseFormItem>;
  }
});
