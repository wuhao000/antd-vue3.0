import classNames from 'classnames';
import {isMobile} from 'is-mobile';
import {defineComponent, getCurrentInstance, h, inject} from 'vue';
import {getComponentFromProp, getOptionProps} from '../_util/props-util';
import {cloneElement} from '../_util/vnode';
import PropTypes from '../_util/vue-types';
import Button from '../button';
import {ConfigConsumerProps, IConfigProvider} from '../config-provider';
import Icon from '../icon';
import Input from './Input';
import inputProps from './inputProps';

export default defineComponent({
  name: 'AInputSearch',
  inheritAttrs: false,
  props: {
    ...inputProps,
    enterButton: PropTypes.any
  },
  setup(props, {emit}) {
    const componentInstance = getCurrentInstance();
    const configProvider: IConfigProvider = inject('configProvider') || ConfigConsumerProps;
    const onChange = (e) => {
      if (e && e.target && e.type === 'click') {
        emit('search', e.target.value, e);
      }
      emit('change', e);
    };
    const onSearch = (e) => {
      if (props.loading || props.disabled) {
        return;
      }
      emit('search', (componentInstance.refs.input as any).stateValue, e);
      if (!isMobile({tablet: true})) {
        (componentInstance.refs.input as any).focus();
      }
    };
    const focus = () => {
      (componentInstance.refs.input as any).focus();
    };
    const blur = () => {
      (componentInstance.refs.input as any).blur();
    };
    const renderLoading = (prefixCls) => {
      const {size} = props;
      let enterButton = getComponentFromProp(componentInstance, 'enterButton');
      // 兼容 <a-input-search enterButton />， 因enterButton类型为 any，此类写法 enterButton 为空字符串
      enterButton = enterButton || enterButton === '';
      if (enterButton) {
        return (
            <Button class={`${prefixCls}-button`} type="primary" size={size} key="enterButton">
              <Icon type="loading"/>
            </Button>
        );
      }
      return <Icon class={`${prefixCls}-icon`} type="loading" key="loadingIcon"/>;
    };
    const renderSuffix = (prefixCls) => {
      const {loading} = props;
      const suffix = getComponentFromProp(componentInstance, 'suffix');
      let enterButton = getComponentFromProp(componentInstance, 'enterButton');
      // 兼容 <a-input-search enterButton />， 因enterButton类型为 any，此类写法 enterButton 为空字符串
      enterButton = enterButton || enterButton === '';
      if (loading && !enterButton) {
        return [suffix, renderLoading(prefixCls)];
      }

      if (enterButton) {
        return suffix;
      }

      const icon = (
          <Icon class={`${prefixCls}-icon`} type="search" key="searchIcon" onClick={onSearch}/>
      );

      if (suffix) {
        // let cloneSuffix = suffix;
        // if (isValidElement(cloneSuffix) && !cloneSuffix.key) {
        //   cloneSuffix = cloneElement(cloneSuffix, {
        //     key: 'originSuffix',
        //   });
        // }
        return [suffix, icon];
      }

      return icon;
    };
    const renderAddonAfter = (prefixCls) => {
      const {size, disabled, loading} = props;
      const btnClassName = `${prefixCls}-button`;
      let enterButton = getComponentFromProp(componentInstance, 'enterButton');
      enterButton = enterButton || enterButton === '';
      const addonAfter = getComponentFromProp(componentInstance, 'addonAfter');
      if (loading && enterButton) {
        return [renderLoading(prefixCls), addonAfter];
      }
      if (!enterButton) {
        return addonAfter;
      }
      const enterButtonAsElement = Array.isArray(enterButton) ? enterButton[0] : enterButton;
      let button;
      const isAntdButton =
          enterButtonAsElement.componentOptions &&
          enterButtonAsElement.componentOptions.Ctor.extendOptions.__ANT_BUTTON;
      if (enterButtonAsElement.tag === 'button' || isAntdButton) {
        button = cloneElement(enterButtonAsElement, {
          key: 'enterButton',
          class: isAntdButton ? btnClassName : '',
          ...(isAntdButton ? {size} : {}),
          onClick: onSearch
        });
      } else {
        button = (
            <Button
                class={btnClassName}
                type="primary"
                size={size}
                disabled={disabled}
                key="enterButton"
                onClick={onSearch}
            >
              {enterButton === true || enterButton === '' ? <Icon type="search"/> : enterButton}
            </Button>
        );
      }
      if (addonAfter) {
        return [button, addonAfter];
      }
      return button;
    };
    return {configProvider, onSearch, onChange, renderSuffix, renderAddonAfter};
  },
  render() {
    const {
      prefixCls: customizePrefixCls,
      inputPrefixCls: customizeInputPrefixCls,
      size,
      loading,
      ...others
    } = getOptionProps(this);
    const getPrefixCls = this.configProvider.getPrefixCls;
    const prefixCls = getPrefixCls('input-search', customizePrefixCls);
    const inputPrefixCls = getPrefixCls('input', customizeInputPrefixCls);
    const componentInstance = getCurrentInstance();

    let enterButton = getComponentFromProp(componentInstance, 'enterButton');
    const addonBefore = getComponentFromProp(componentInstance, 'addonBefore');
    enterButton = enterButton || enterButton === '';
    let inputClassName;
    if (enterButton) {
      inputClassName = classNames(prefixCls, {
        [`${prefixCls}-enter-button`]: !!enterButton,
        [`${prefixCls}-${size}`]: !!size
      });
    } else {
      inputClassName = prefixCls;
    }
    const inputProps = {
      ...others,
      prefixCls: inputPrefixCls,
      size,
      suffix: this.renderSuffix(prefixCls),
      prefix: getComponentFromProp(componentInstance, 'prefix'),
      addonAfter: this.renderAddonAfter(prefixCls),
      addonBefore,
      className: inputClassName,
      ...this.$attrs,
      ref: 'input',
      onPressEnter: this.onSearch,
      onChange: this.onChange
    };
    return <Input {...inputProps}/>;
  }
});
