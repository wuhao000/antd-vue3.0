import {useFormContext} from '@/components/form/src/form';
import classNames from 'classnames';
import {cloneVNode, defineComponent, getCurrentInstance, inject, provide, ref} from 'vue';
import getTransitionProps from '../../_util/get-transition-props';
import {getComponentFromProp, initDefaultProps, isValidElement} from '../../_util/props-util';
import PropTypes from '../../_util/vue-types';
import warning from '../../_util/warning';
import {ConfigConsumerProps, IConfigProvider} from '../../config-provider';
import Col, {ColProps} from '../../grid/col';
import Row from '../../grid/row';
import Icon from '../../icon';
import {FIELD_DATA_PROP, FIELD_META_PROP} from './constants';

function intersperseSpace(list) {
  return list.reduce((current, item) => [...current, ' ', item], []).slice(1);
}

export const FormItemProps = () => ({
  id: PropTypes.string,
  htmlFor: PropTypes.string,
  prefixCls: PropTypes.string,
  label: PropTypes.any,
  labelCol: PropTypes.shape(ColProps).loose,
  wrapperCol: PropTypes.shape(ColProps).loose,
  help: PropTypes.any,
  extra: PropTypes.any,
  validateStatus: PropTypes.oneOf(['', 'success', 'warning', 'error', 'validating']),
  hasFeedback: PropTypes.bool,
  required: PropTypes.bool,
  colon: PropTypes.bool,
  fieldDecoratorId: PropTypes.string,
  fieldDecoratorOptions: PropTypes.object,
  selfUpdate: PropTypes.bool,
  labelAlign: PropTypes.oneOf(['left', 'right'])
});

function comeFromSlot(vnodes = [], itemVnode) {
  let isSlot = false;
  for (let i = 0, len = vnodes.length; i < len; i++) {
    const vnode = vnodes[i];
    if (vnode && (vnode === itemVnode || vnode.$vnode === itemVnode)) {
      isSlot = true;
    } else {
      const componentOptions =
          vnode.componentOptions || (vnode.$vnode && vnode.$vnode.componentOptions);
      const children = componentOptions ? componentOptions.children : vnode.$children;
      isSlot = comeFromSlot(children, itemVnode);
    }
    if (isSlot) {
      break;
    }
  }
  return isSlot;
}

export default defineComponent({
  name: 'BaseFormItem',
  props: initDefaultProps(FormItemProps(), {
    hasFeedback: false
  }),
  setup(props, {slots, attrs}) {
    provide('isFormItemChildren', true);
    const controls = attrs.controls;
    const componentInstance = getCurrentInstance();
    const isFormItemChildren = inject('isFormItemChildren') || false;
    const FormContext = useFormContext();
    const decoratorFormProps = inject('decoratorFormProps') || {};
    const configProvider: IConfigProvider = inject('configProvider') || ConfigConsumerProps;
    const helpShow = ref(false);
    // Resolve duplicated ids bug between different forms
    // https://github.com/ant-design/ant-design/issues/7351
    const getId = () => {
      return getChildAttr('id');
    };
    const onLabelClick = () => {
      const id = props.id || getId();
      if (!id) {
        return;
      }
      const formItemNode = componentInstance.vnode.el;
      const control = formItemNode.querySelector(`[id="${id}"]`);
      if (control && control.focus) {
        control.focus();
      }
    };
    const isRequired = () => {
      const {required} = props;
      if (required !== undefined) {
        return required;
      }
    };
    const getOnlyControl = () => {
      const child = controls?.[0];
      return child !== undefined ? child : null;
    };
    const getField = () => {
      return getChildAttr(FIELD_DATA_PROP);
    };
    const getChildAttr = (prop) => {
      const child = getOnlyControl();
      if (child) {
        return child.attrs[prop];
      }
      return undefined;
    };
    const getHelpMessage = () => {
      const help = getComponentFromProp(componentInstance, 'help');
      const onlyControl = getOnlyControl();
      if (help === undefined && onlyControl) {
        const errors = getField().errors;
        if (errors) {
          return intersperseSpace(
              errors.map((e, index) => {
                let node = null;
                if (isValidElement(e)) {
                  node = e;
                } else if (isValidElement(e.message)) {
                  node = e.message;
                }
                return node ? cloneVNode(node, {key: index}) : e.message;
              })
          );
        } else {
          return '';
        }
      }

      return help;
    };
    const onHelpAnimEnd = (_key, show) => {
      helpShow.value = show;
    };
    const renderHelp = (prefixCls) => {
      const help = getHelpMessage();
      const children = help ? (
          <div class={`${prefixCls}-explain`} key="help">
            {help}
          </div>
      ) : null;
      if (children) {
        helpShow.value = !!children;
      }
      const transitionProps = getTransitionProps('show-help', {
        afterEnter: () => onHelpAnimEnd('help', true),
        afterLeave: () => onHelpAnimEnd('help', false)
      });
      return (
          <transition {...transitionProps} key="help">
            {children}
          </transition>
      );
    };

    const renderExtra = (prefixCls) => {
      const extra = getComponentFromProp(componentInstance, 'extra');
      return extra ? <div class={`${prefixCls}-extra`}>{extra}</div> : null;
    };
    const getMeta = () => {
      return getChildAttr(FIELD_META_PROP);
    };
    const getValidateStatus = () => {
      const onlyControl = getOnlyControl();
      if (!onlyControl) {
        return '';
      }
      const field = getField();
      if (field.validating) {
        return 'validating';
      }
      if (field.errors) {
        return 'error';
      }
      const fieldValue = 'value' in field ? field.value : getMeta().initialValue;
      if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
        return 'success';
      }
      return '';
    };
    const renderValidateWrapper = (prefixCls, c1, c2, c3) => {
      const onlyControl = getOnlyControl();
      const validateStatus =
          props.validateStatus === undefined && onlyControl
              ? getValidateStatus()
              : props.validateStatus;

      let classes = `${prefixCls}-item-control`;
      if (validateStatus) {
        classes = classNames(`${prefixCls}-item-control`, {
          'has-feedback': props.hasFeedback || validateStatus === 'validating',
          'has-success': validateStatus === 'success',
          'has-warning': validateStatus === 'warning',
          'has-error': validateStatus === 'error',
          'is-validating': validateStatus === 'validating'
        });
      }
      let iconType = '';
      switch (validateStatus) {
        case 'success':
          iconType = 'check-circle';
          break;
        case 'warning':
          iconType = 'exclamation-circle';
          break;
        case 'error':
          iconType = 'close-circle';
          break;
        case 'validating':
          iconType = 'loading';
          break;
        default:
          iconType = '';
          break;
      }
      const icon =
          props.hasFeedback && iconType ? (
              <span class={`${prefixCls}-item-children-icon`}>
                <Icon type={iconType} theme={iconType === 'loading' ? 'outlined' : 'filled'}/>
              </span>
          ) : null;
      return (
          <div class={classes}>
            <span class={`${prefixCls}-item-children`}>
              {c1}
              {icon}
            </span>
            {c2}
            {c3}
          </div>
      );
    };

    const renderWrapper = (prefixCls, children) => {
      const {wrapperCol: contextWrapperCol} = isFormItemChildren ? {} : FormContext;
      const {wrapperCol} = props;
      const mergedWrapperCol = wrapperCol || contextWrapperCol || {};
      const {style, id, ...restProps} = mergedWrapperCol;
      const className = classNames(`${prefixCls}-item-control-wrapper`, mergedWrapperCol.class);
      const colProps = {
        ...restProps,
        class: className,
        key: 'wrapper',
        style,
        id
      };
      return <Col {...colProps}>{children}</Col>;
    };

    const renderLabel = (prefixCls) => {
      const {
        vertical,
        labelAlign: contextLabelAlign,
        labelCol: contextLabelCol,
        colon: contextColon
      } = FormContext;
      const {labelAlign, labelCol, colon, id, htmlFor} = props;
      const label = getComponentFromProp(componentInstance, 'label');
      const required = isRequired();
      const mergedLabelCol = labelCol || contextLabelCol || {};

      const mergedLabelAlign = labelAlign || contextLabelAlign;
      const labelClsBasic = `${prefixCls}-item-label`;
      const labelColClassName = classNames(
          labelClsBasic,
          mergedLabelAlign === 'left' && `${labelClsBasic}-left`,
          mergedLabelCol.class
      );
      const {
        class: labelColClass,
        style: labelColStyle,
        id: labelColId,
        ...restProps
      } = mergedLabelCol;
      let labelChildren = label;
      // Keep label is original where there should have no colon
      const computedColon = colon === true || (contextColon !== false && colon !== false);
      const haveColon = computedColon && !vertical;
      // Remove duplicated user input colon
      if (haveColon && typeof label === 'string' && label.trim() !== '') {
        labelChildren = label.replace(/[：:]\s*$/, '');
      }

      const labelClassName = classNames({
        [`${prefixCls}-item-required`]: required,
        [`${prefixCls}-item-no-colon`]: !computedColon
      });
      const colProps = {
        ...restProps,
        class: labelColClassName,
        key: 'label',
        style: labelColStyle,
        id: labelColId
      };
      return label ? (
          <Col {...colProps}>
            <label
                for={htmlFor || id || getId()}
                class={labelClassName}
                title={typeof label === 'string' ? label : ''}
                onClick={onLabelClick}>
              {labelChildren}
            </label>
          </Col>
      ) : null;
    };
    const renderChildren = (prefixCls) => {
      return [
        renderLabel(prefixCls),
        renderWrapper(
            prefixCls,
            renderValidateWrapper(
                prefixCls,
                slots.default && slots.default(),
                renderHelp(prefixCls),
                renderExtra(prefixCls)
            )
        )
      ];
    };

    // const decoratorOption = (vnode) => {
    //   if (vnode.data && vnode.data.directives) {
    //     const directive = find(vnode.data.directives, ['name', 'decorator']);
    //     warning(
    //         !directive || (directive && Array.isArray(directive.value)),
    //         'Form',
    //         `Invalid directive: type check failed for directive "decorator". Expected Array, got ${typeof (directive
    //             ? directive.value
    //             : directive)}. At ${vnode.tag}.`
    //     );
    //     return directive ? directive.value : null;
    //   } else {
    //     return null;
    //   }
    // };
    // const decoratorChildren = (vnodes) => {
    //   const getFieldDecorator = FormContext.form.getFieldDecorator;
    //   for (let i = 0, len = vnodes.length; i < len; i++) {
    //     const vnode = vnodes[i];
    //     if (getSlotOptions(vnode).__ANT_FORM_ITEM) {
    //       break;
    //     }
    //     if (vnode.children) {
    //       vnode.children = this.decoratorChildren(cloneVNodes(vnode.children));
    //     } else if (vnode.componentOptions && vnode.componentOptions.children) {
    //       vnode.componentOptions.children = this.decoratorChildren(
    //           cloneVNodes(vnode.componentOptions.children)
    //       );
    //     }
    //     const option = this.decoratorOption(vnode);
    //     if (option && option[0]) {
    //       vnodes[i] = getFieldDecorator(option[0], option[1], this)(vnode);
    //     }
    //   }
    //   return vnodes;
    // };
    return {
      helpShow,
      decoratorFormProps,
      configProvider,
      FormContext,
      renderChildren
    };
  },
  render(ctx) {
    const {prefixCls: customizePrefixCls} = ctx;
    const getPrefixCls = ctx.configProvider.getPrefixCls;
    const prefixCls = getPrefixCls('form', customizePrefixCls);
    const children = ctx.renderChildren(prefixCls);
    const itemClassName = {
      [`${prefixCls}-item`]: true,
      [`${prefixCls}-item-with-help`]: ctx.helpShow.value
    };

    return (
        <Row class={classNames(itemClassName)} key="row">
          {children}
        </Row>
    );
  }
}) as any;
