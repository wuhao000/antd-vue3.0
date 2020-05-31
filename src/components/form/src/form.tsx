import {FormItemContext} from '@/components/form/src/form-item';
import {ProvideKeys} from '@/components/form/src/utils';
import {useLocalValue} from '@/tools/value';
import {Rules} from 'async-validator';
import classNames from 'classnames';
import {computed, defineComponent, getCurrentInstance, inject, onUpdated, provide, reactive, ref} from 'vue';
import PropTypes from '../../_util/vue-types';
import DButton from '../../button';

export const useFormContext = () => {
  return inject(ProvideKeys.FormContext, {
    addField(f) {
    },
    removeField(f) {
    },
    collect() {
    }
  }) as IFormContext;
};

export const useForm = () => {
  const formContext = inject(ProvideKeys.FormContext) as IFormContext;
  const formItemContext = inject(ProvideKeys.FormItemContext, {
    registerControl: (c) => {
    },
    emit: (e) => {
    }
  }) as FormItemContext;
  return {
    formItemContext,
    registerField: (field) => {
      formContext.addField(field);
    },
    unRegisterField: (field) => {
      formContext.removeField(field);
    },
    registerControl: () => {
      const control = getCurrentInstance();
      formItemContext.registerControl(control);
    },
    labelWidth: formContext?.labelWidth
  };
};

const FormProps = {
  // 显示取消确认按钮，分别产生cancel和ok事件，cancel和ok没有默认操作，完全由用户定义
  okCancel: {type: Boolean, default: false},
  // 'small' | 'large' | 'default'
  size: {type: String, default: 'default'},
  colon: PropTypes.bool,
  disabled: {type: Boolean, default: false},
  readOnly: {type: Boolean, default: false},
  labelCol: {
    type: [Number, Object]
  },
  okText: {type: String, default: '确定'},
  cancelText: {type: String, default: '取消'},
  inline: {type: Boolean, default: false},
  labelAlign: PropTypes.oneOf(['left', 'right']),
  // 标签宽度
  labelWidth: {type: [String, Number]},
  hideRequiredMark: {type: Boolean},
  // 'horizontal' | 'inline' | 'vertical'
  layout: {type: String, default: 'horizontal'},
  model: {type: Object},
  rules: {type: Object},
  onSubmit: {
    type: Function, default() {
      return () => {
      };
    }
  },
  hasError: {type: Boolean, default: false},
  wrapperCol: {
    type: [Number, Object], default(this: any) {
      // const layout = this.$options.propsData &&
      //     this.$options.propsData.layout;
      // if (layout === 'horizontal') {
      //   return {
      //     xs: {span: 24},
      //     sm: {span: 12},
      //     md: {span: 10}
      //   };
      // }
      return 0;
    }
  },
  form: {type: Object}
};

interface ColType {
  span: number | string;
  order: number | string;
  offset: number | string;
  push: number | string;
  pull: number | string;
  xs: number | string;
  sm: number | string;
  md: number | string;
  lg: number | string;
  xl: number | string;
  xxl: number | string;
  prefixCls: string;
}

export interface IFormContext {
  validateField?: (props, cb) => void;
  addField?: (field) => void;
  rules?: Rules;
  labelCol?: number | ColType;
  wrapperCol?: number | ColType;
  colon?: boolean;
  vertical?: boolean;
  labelAlign?: 'left' | 'right';
  resetFields?: () => void;
  clearValidate?: (props?: any[]) => void;
  labelWidth?: number | string;
  removeField?: (field) => void;
  collect: () => any;
}

export default defineComponent({
  name: 'AForm',
  props: FormProps,
  setup(props, {emit}) {
    const prefixCls = 'ant-form';
    const {setValue: setHasError} = useLocalValue(false, 'hasError');
    const fields = ref(reactive([]));
    const fieldErrors = computed(() => {
      return fields.value.length;
    });
    const formContext = reactive<IFormContext>({
      colon: props.colon,
      labelCol: props.labelCol,
      vertical: props.layout === 'vertical',
      labelAlign: props.labelAlign,
      labelWidth: props.labelWidth,
      wrapperCol: props.wrapperCol,
      rules: props.rules,
      addField: (field) => {
        if (field) {
          fields.value.push(field);
        }
      },
      removeField: (field) => {
        if (field.prop) {
          fields.value.splice(fields.value.indexOf(field), 1);
        }
      },
      resetFields: () => {
        if (!props.model) {
          console.warn('[Element Warn][Form]model is required for resetFields to work.');
          return;
        }
        fields.value.forEach(field => {
          (field as any).resetField();
        });
      },
      clearValidate: (props = []) => {
        const f = props.length
            ? (typeof props === 'string'
                    ? fields.value.filter(field => props === (field as any).prop)
                    : fields.value.filter(field => props.indexOf((field as any).prop) > -1)
            ) : fields.value;
        f.forEach(field => {
          (field as any).clearValidate();
        });
      },
      validateField: (props, cb) => {
        const copyProps = [].concat(props);
        const f = fields.value.filter(field => copyProps.indexOf((field as any).prop) !== -1);
        if (!f.length) {
          console.warn('[Element Warn]please pass correct props!');
          return;
        }
        f.forEach(field => {
          (field as any).validate('', cb);
        });
      },
      collect() {
        const errors = fields.value.map(it => it.ctx.help).filter(it => !!it);
        setHasError(errors.length > 0);
      }
    });
    onUpdated(() => {
      formContext.colon = props.colon;
      formContext.labelCol = props.labelCol;
      formContext.vertical = props.layout === 'vertical';
      formContext.labelAlign = props.labelAlign;
      formContext.wrapperCol = props.wrapperCol;
      formContext.labelWidth = props.labelWidth;
      formContext.rules = props.rules;
    });
    provide(ProvideKeys.FormContext, formContext);
    const validate = async (callback) => {
      if (!props.model) {
        const res = await Promise.all(fields.value.map(field => field.ctx.validate()));
        const errors = res.filter(it => it.errors);
        setHasError(errors.length > 0);
        callback && callback(errors);
        return;
      }
      let promise;
      let copyCallback = callback;
      // if no callback, return promise
      if (typeof copyCallback !== 'function' && Promise) {
        promise = new Promise((resolve, reject) => {
          copyCallback = (valid) => {
            const errorField = fields.value.find(it => it.currentValidateStatus === 'error');
            if (errorField) {
              errorField.focus();
            }
            valid ? resolve(valid) : reject(valid);
          };
        });
      }

      let valid = true;
      let count = 0;
      // 如果需要验证的fields为空，调用验证时立刻返回callback
      if (fields.value.length === 0 && copyCallback) {
        copyCallback(true);
      }
      let invalidFields = {};
      fields.value.forEach(field => {
        field.validate('', (message, field) => {
          if (message) {
            valid = false;
          }
          invalidFields = Object.assign({}, invalidFields, field);
          if (typeof copyCallback === 'function' && ++count === fields.value.length) {
            copyCallback(valid, invalidFields);
          }
        });
      });
      if (promise) {
        return promise;
      }
    };

    const renderButtons = () => {
      if (props.okCancel) {
        return <div class={prefixCls + '-footer-btns'}>
          {
            // @ts-ignore
            <DButton onClick={(e) => {
              emit('cancel', e);
            }}>{props.cancelText}</DButton>
          }
          {
            // @ts-ignore
            <DButton
                onClick={(e) => {
                  emit('ok', e);
                }}
                type={'primary'}
                style={{marginLeft: '8px'}}>{props.okText}</DButton>
          }
        </div>;
      }
    };
    const getLayout = () => {
      if (props.inline) {
        return 'inline';
      } else {
        return props.layout;
      }
    };
    if (props.form) {
      props.form.validate = validate;
    }
    return {
      prefixCls,
      fieldErrors,
      renderButtons,
      getLayout
    };
  },
  render() {
    const {
      prefixCls,
      hideRequiredMark,
      onSubmit,
      $slots
    } = this;
    const layout = this.getLayout();
    const formClassName = classNames(prefixCls, {
      [`${prefixCls}-horizontal`]: layout === 'horizontal',
      [`${prefixCls}-vertical`]: layout === 'vertical',
      [`${prefixCls}-inline`]: layout === 'inline',
      [`${prefixCls}-hide-required-mark`]: hideRequiredMark
    });
    // @ts-ignore
    return <form onSubmit={onSubmit} class={formClassName}>
      {$slots.default()}
      {this.renderButtons()}
    </form>;
  }
}) as any;
