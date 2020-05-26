import {ComponentInternalInstance} from '@vue/runtime-core';
import classNames from 'classnames';
import {cloneVNode, defineComponent, getCurrentInstance} from 'vue';
import {getComponentFromProp} from '../_util/props-util';
import PropTypes from '../_util/vue-types';
import Icon from '../icon';
import AIcon from '../icon';

export function hasPrefixSuffix(instance: ComponentInternalInstance) {
  return !!(
      getComponentFromProp(instance, 'prefix') ||
      getComponentFromProp(instance, 'suffix') ||
      instance.props.allowClear
  );
}

const ClearableInputType = ['text', 'input'];

const ClearableLabeledInput: any = defineComponent({
  components: {
    AIcon: Icon
  },
  props: {
    prefixCls: PropTypes.string,
    inputType: PropTypes.oneOf(ClearableInputType),
    value: PropTypes.any,
    defaultValue: PropTypes.any,
    allowClear: PropTypes.bool,
    element: PropTypes.any,
    handleReset: PropTypes.func,
    disabled: PropTypes.bool,
    size: PropTypes.oneOf(['small', 'large', 'default']),
    suffix: PropTypes.any,
    prefix: PropTypes.any,
    addonBefore: PropTypes.any,
    addonAfter: PropTypes.any,
    className: PropTypes.string,
    readOnly: PropTypes.bool
  },
  setup(props, {attrs}) {
    const componentInstance = getCurrentInstance();
    const renderSuffix = (prefixCls: string) => {
      const {suffix, allowClear} = props;
      if (suffix || allowClear) {
        return (
            <span class={`${prefixCls}-suffix`}>
              {renderClearIcon(prefixCls)}
              {suffix}
            </span>
        );
      }
      return null;
    };
    const renderClearIcon = (prefixCls: string) => {
      const {allowClear, value, disabled, readOnly, inputType, handleReset} = props;
      if (!allowClear || disabled || readOnly || value === undefined ||
          value === null || value === '') {
        return null;
      }
      const className = inputType === ClearableInputType[0]
          ? `${prefixCls}-textarea-clear-icon`
          : `${prefixCls}-clear-icon`;
      return <AIcon type="close-circle"
                    theme="filled"
                    onClick={handleReset}
                    class={className}
                    role="button"/>;
    };
    const renderLabeledIcon = (prefixCls: string, element) => {
      const suffix = renderSuffix(prefixCls);
      if (!hasPrefixSuffix(componentInstance)) {
        return element;
      }
      const prefix = props.prefix ? (
          <span class={`${prefixCls}-prefix`}>{props.prefix}</span>
      ) : null;

      const affixWrapperCls = classNames(props.className, `${prefixCls}-affix-wrapper`, {
        [`${prefixCls}-affix-wrapper-sm`]: props.size === 'small',
        [`${prefixCls}-affix-wrapper-lg`]: props.size === 'large',
        [`${prefixCls}-affix-wrapper-input-with-clear-btn`]:
        props.suffix && props.allowClear && props.value
      });

      return (
          <span class={affixWrapperCls} style={attrs.style}>
            {prefix}
            {element}
            {suffix}
          </span>
      );
    };
    const renderInputWithLabel = (prefixCls, labeledElement) => {
      const {addonBefore, addonAfter, size, className} = props;
      const style = attrs.style;
      // Not wrap when there is not addons
      if (!addonBefore && !addonAfter) {
        return labeledElement;
      }

      const wrapperClassName = `${prefixCls}-group`;
      const addonClassName = `${wrapperClassName}-addon`;
      const addonBeforeNode = addonBefore ? (
          <span class={addonClassName}>{addonBefore}</span>
      ) : null;
      const addonAfterNode = addonAfter ? <span class={addonClassName}>{addonAfter}</span> : null;

      const mergedWrapperClassName = classNames(`${prefixCls}-wrapper`, {
        [wrapperClassName]: addonBefore || addonAfter
      });

      const mergedGroupClassName = classNames(className, `${prefixCls}-group-wrapper`, {
        [`${prefixCls}-group-wrapper-sm`]: size === 'small',
        [`${prefixCls}-group-wrapper-lg`]: size === 'large'
      });

      // Need another wrapper for changing display:table to display:inline-block
      // and put style prop in wrapper
      return (
          <span class={mergedGroupClassName} style={style}>
            <span class={mergedWrapperClassName}>
              {addonBeforeNode}
              {cloneVNode(labeledElement, {style: null})}
              {addonAfterNode}
            </span>
          </span>
      );
    };
    const renderTextAreaWithClearIcon = (prefixCls, element) => {
      const {value, allowClear, className} = props;
      const style = attrs.style;
      if (!allowClear) {
        return cloneVNode(element, {
          props: {value}
        });
      }
      const affixWrapperCls = classNames(
          className,
          `${prefixCls}-affix-wrapper`,
          `${prefixCls}-affix-wrapper-textarea-with-clear-btn`
      );
      return (
          <span class={affixWrapperCls} style={style}>
            {cloneVNode(element, {
              style: null,
              props: {value}
            })}
            {renderClearIcon(prefixCls)}
          </span>
      );
    };
    const renderClearableLabeledInput = () => {
      const {prefixCls, inputType, element} = props;
      if (inputType === ClearableInputType[0]) {
        return renderTextAreaWithClearIcon(prefixCls, element);
      }
      return renderInputWithLabel(prefixCls, renderLabeledIcon(prefixCls, element));
    };
    return {renderClearableLabeledInput};
  },
  render() {
    return this.renderClearableLabeledInput();
  }
});

export default ClearableLabeledInput;
