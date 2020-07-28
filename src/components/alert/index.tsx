import classNames from 'classnames';
import {defineComponent, ref, Transition} from 'vue';
import getTransitionProps from '../_util/get-transition-props';
import {getComponentFromContext, isValidElement} from '../_util/props-util';
import {cloneElement} from '../_util/vnode';
import PropTypes from '../_util/vue-types';
import Base from '../base';
import {useConfigProvider} from '../config-provider';
import Icon from '../icon';

function noop() {
}

export const AlertProps = {
  /**
   * Type of Alert styles, options:`success`, `info`, `warning`, `error`
   */
  type: PropTypes.oneOf(['success', 'info', 'warning', 'error']),
  /** Whether Alert can be closed */
  closable: PropTypes.bool,
  /** Close text to show */
  closeText: PropTypes.any,
  /** Content of Alert */
  message: PropTypes.any,
  /** Additional content of Alert */
  description: PropTypes.any,
  /** Callback when close Alert */
  // onClose?: React.MouseEventHandler<HTMLAnchorElement>;
  /** Trigger when animation ending of Alert */
  afterClose: PropTypes.func.def(noop),
  /** Whether to show icon */
  showIcon: PropTypes.bool,
  iconType: PropTypes.string,
  prefixCls: PropTypes.string,
  banner: PropTypes.bool,
  icon: PropTypes.any
};

const Alert = defineComponent({
  name: 'AAlert',
  props: AlertProps,
  setup($props, {emit}) {
    const closing = ref(false);
    const closed = ref(false);
    const rootRef = ref(undefined);
    const handleClose = (e) => {
      e.preventDefault();
      const dom = rootRef.value;
      dom.style.height = `${dom.offsetHeight}px`;
      // Magic code
      // 重复一次后才能正确设置 height
      dom.style.height = `${dom.offsetHeight}px`;
      closing.value = true;
      emit('close', e);
    };
    const animationEnd = () => {
      closing.value = false;
      closed.value = true;
      $props.afterClose && $props.afterClose();
    };
    return {
      handleClose,
      animationEnd,
      closing,
      closed,
      configProvider: useConfigProvider(),
      setRootRef: (el) => {
        rootRef.value = el;
      }
    };
  },
  render() {
    const {prefixCls: customizePrefixCls, banner, closing, closed} = this;
    const getPrefixCls = this.configProvider.getPrefixCls;
    const prefixCls = getPrefixCls('alert', customizePrefixCls);

    let {closable, type, showIcon, iconType} = this;
    const closeText = getComponentFromContext(this, 'closeText');
    const description = getComponentFromContext(this, 'description');
    const message = getComponentFromContext(this, 'message');
    const icon = getComponentFromContext(this, 'icon');
    // banner模式默认有 Icon
    showIcon = banner && showIcon === undefined ? true : showIcon;
    // banner模式默认为警告
    type = banner && type === undefined ? 'warning' : type || 'info';
    let iconTheme = 'filled';

    if (!iconType) {
      switch (type) {
        case 'success':
          iconType = 'check-circle';
          break;
        case 'info':
          iconType = 'info-circle';
          break;
        case 'error':
          iconType = 'close-circle';
          break;
        case 'warning':
          iconType = 'exclamation-circle';
          break;
        default:
          iconType = 'default';
      }

      // use outline icon in alert with description
      if (description) {
        iconTheme = 'outlined';
      }
    }

    // closeable when closeText is assigned
    if (closeText) {
      closable = true;
    }

    const alertCls = classNames(prefixCls, {
      [`${prefixCls}-${type}`]: true,
      [`${prefixCls}-closing`]: closing,
      [`${prefixCls}-with-description`]: !!description,
      [`${prefixCls}-no-icon`]: !showIcon,
      [`${prefixCls}-banner`]: !!banner,
      [`${prefixCls}-closable`]: closable
    });

    const closeIcon = closable ? (
        <a type="button" onClick={this.handleClose}
           class={`${prefixCls}-close-icon`} tabindex={0}>
          {closeText ? (
              <span class={`${prefixCls}-close-text`}>{closeText}</span>
          ) : (
              <Icon type="close"/>
          )}
        </a>
    ) : null;

    const iconNode = (icon &&
        (isValidElement(icon) ? (
            cloneElement(icon, {
              class: `${prefixCls}-icon`
            })
        ) : (
            <span class={`${prefixCls}-icon`}>{icon}</span>
        ))) || <Icon class={`${prefixCls}-icon`} type={iconType} theme={iconTheme}/>;

    const transitionProps = getTransitionProps(`${prefixCls}-slide-up`, {
      appear: false,
      afterLeave: this.animationEnd
    });
    return closed ? null : (
        <Transition {...transitionProps}>
          <div ref={this.setRootRef} v-show={!closing} class={alertCls} data-show={!closing}>
            {showIcon ? iconNode : null}
            <span class={`${prefixCls}-message`}>{message}</span>
            <span class={`${prefixCls}-description`}>{description}</span>
            {closeIcon}
          </div>
        </Transition>
    );
  }
}) as any;

/* istanbul ignore next */
Alert.install = function(Vue) {
  Vue.use(Base);
  Vue.component(Alert.name, Alert);
};

export default Alert;
