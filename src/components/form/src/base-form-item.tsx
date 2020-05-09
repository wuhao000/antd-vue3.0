import {IFormContext} from '@/components/form/src/form';
import classNames from 'classnames';
import find from 'lodash/find';
import {defineComponent, getCurrentInstance, inject, provide, ref} from 'vue';
import getTransitionProps from '../../_util/getTransitionProps';
import {
  filterEmpty,
  getAllChildren,
  getComponentFromProp,
  getSlotOptions,
  initDefaultProps,
  isValidElement
} from '../../_util/props-util';
import {cloneElement, cloneVNodes} from '../../_util/vnode';
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

export const FormItemProps = {
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
};

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
  props: initDefaultProps(FormItemProps, {
    hasFeedback: false
  }),
  setup(props, {slots}) {
    provide('isFormItemChildren', true);
    const slotDefault = ref(slots.default());
    const componentInstance = getCurrentInstance();
    const isFormItemChildren = inject('isFormItemChildren') || false;
    const FormContext: IFormContext = inject('FormContext') || {};
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
      const child = getControls(slotDefault.value, false)[0];
      return child !== undefined ? child : null;
    };
    const getControls = (childrenArray = [], recursively) => {
      let controls = [];
      for (let i = 0; i < childrenArray.length; i++) {
        if (!recursively && controls.length > 0) {
          break;
        }

        const child = childrenArray[i];
        console.log(child);
        if (!child.tag && typeof child.children === 'string' && child.children.trim() === '') {
          continue;
        }

        if (getSlotOptions(child).__ANT_FORM_ITEM) {
          continue;
        }
        const children = getAllChildren(child);
        const attrs = (child.data && child.data.attrs) || {};
        if (FIELD_META_PROP in attrs) {
          // And means FIELD_DATA_PROP in child.props, too.
          controls.push(child);
        } else if (children) {
          controls = controls.concat(getControls(children, recursively));
        }
      }
      return controls;
    };
    const getField = () => {
      return getChildAttr(FIELD_DATA_PROP);
    };
    const getChildAttr = (prop) => {
      const child = getOnlyControl();
      let data = {};
      if (!child) {
        return undefined;
      }
      if (child.data) {
        data = child.data;
      } else if (child.$vnode && child.$vnode.data) {
        data = child.$vnode.data;
      }
      return data[prop] || data.attrs[prop];
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
                return node ? cloneElement(node, {key: index}) : e.message;
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
      const {style, id, on, ...restProps} = mergedWrapperCol;
      const className = classNames(`${prefixCls}-item-control-wrapper`, mergedWrapperCol.class);
      const colProps = {
        props: restProps,
        class: className,
        key: 'wrapper',
        style,
        id,
        on
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
        on,
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
        props: restProps,
        class: labelColClassName,
        key: 'label',
        style: labelColStyle,
        id: labelColId,
        on
      };

      return label ? (
          <Col {...colProps}>
            <label
                for={htmlFor || id || getId()}
                class={labelClassName}
                title={typeof label === 'string' ? label : ''}
                onClick={onLabelClick}
            >
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
                slotDefault.value,
                renderHelp(prefixCls),
                renderExtra(prefixCls)
            )
        )
      ];
    };
    const renderFormItem = () => {
      const {prefixCls: customizePrefixCls} = props;
      const getPrefixCls = configProvider.getPrefixCls;
      const prefixCls = getPrefixCls('form', customizePrefixCls);
      const children = renderChildren(prefixCls);
      const itemClassName = {
        [`${prefixCls}-item`]: true,
        [`${prefixCls}-item-with-help`]: helpShow.value
      };

      return (
          <Row class={classNames(itemClassName)} key="row">
            {children}
          </Row>
      );
    };
    const decoratorOption = (vnode) => {
      if (vnode.data && vnode.data.directives) {
        const directive = find(vnode.data.directives, ['name', 'decorator']);
        warning(
            !directive || (directive && Array.isArray(directive.value)),
            'Form',
            `Invalid directive: type check failed for directive "decorator". Expected Array, got ${typeof (directive
                ? directive.value
                : directive)}. At ${vnode.tag}.`
        );
        return directive ? directive.value : null;
      } else {
        return null;
      }
    };
    const decoratorChildren = (vnodes) => {
      const getFieldDecorator = FormContext.form.getFieldDecorator;
      for (let i = 0, len = vnodes.length; i < len; i++) {
        const vnode = vnodes[i];
        if (getSlotOptions(vnode).__ANT_FORM_ITEM) {
          break;
        }
        if (vnode.children) {
          vnode.children = this.decoratorChildren(cloneVNodes(vnode.children));
        } else if (vnode.componentOptions && vnode.componentOptions.children) {
          vnode.componentOptions.children = this.decoratorChildren(
              cloneVNodes(vnode.componentOptions.children)
          );
        }
        const option = this.decoratorOption(vnode);
        if (option && option[0]) {
          vnodes[i] = getFieldDecorator(option[0], option[1], this)(vnode);
        }
      }
      return vnodes;
    };
    return {helpShow, slotDefault, renderFormItem, decoratorFormProps, configProvider, FormContext};
  },
  render(ctx) {
    const {
      $slots,
      decoratorFormProps,
      fieldDecoratorId,
      fieldDecoratorOptions = {},
      FormContext
    } = this;
    let child = filterEmpty($slots.default);
    if (decoratorFormProps.form && fieldDecoratorId && child.length) {
      const getFieldDecorator = decoratorFormProps.form.getFieldDecorator;
      child[0] = getFieldDecorator(fieldDecoratorId, fieldDecoratorOptions, this)(child[0]);
      warning(
          !(child.length > 1),
          'Form',
          '`autoFormCreate` just `decorator` then first children. but you can use JSX to support multiple children'
      );
      ctx.slotDefault.value = child;
    } else if (FormContext.form) {
      child = cloneVNodes(child);
      ctx.slotDefault.value = this.decoratorChildren(child);
    } else {
      ctx.slotDefault.value = child;
    }
    return this.renderFormItem();
  }
});
