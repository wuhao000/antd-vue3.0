import {useLocalValue} from '@/tools/value';
import classNames from 'classnames';
import {defineComponent, getCurrentInstance} from 'vue';
import {
  getClassFromInstance,
  getComponentFromProp,
  getListenersFromInstance,
  getStyleFromInstance,
  initDefaultProps,
  mergeProps
} from '../_util/props-util';
import PropTypes from '../_util/vue-types';
import Button from '../button';
import buttonTypes from '../button/buttonTypes';
import {useConfigProvider} from '../config-provider';
import Icon from '../icon';
import LocaleReceiver from '../locale-provider/locale-receiver';
import Dialog from '../vc-dialog';
import addEventListener from '../vc-util/Dom/addEventListener';
import {getConfirmLocale} from './locale';

const ButtonType = buttonTypes().type;

let mousePosition = null;
// ref: https://github.com/ant-design/ant-design/issues/15795
const getClickPosition = e => {
  mousePosition = {
    x: e.pageX,
    y: e.pageY
  };
  // 100ms 内发生过点击事件，则从点击位置动画展示
  // 否则直接 zoom 展示
  // 这样可以兼容非点击方式展开
  setTimeout(() => (mousePosition = null), 100);
};

// 只有点击事件支持从鼠标位置动画展开
if (typeof window !== 'undefined' && window.document && window.document.documentElement) {
  addEventListener(document.documentElement, 'click', getClickPosition, true);
}

function noop() {
}

const modalProps = (defaultProps = {}) => {
  const props = {
    prefixCls: PropTypes.string,
    /** 对话框是否可见*/
    visible: PropTypes.bool,
    /** 确定按钮 loading*/
    confirmLoading: PropTypes.bool,
    /** 标题*/
    title: PropTypes.any,
    /** 是否显示右上角的关闭按钮*/
    closable: PropTypes.bool,
    closeIcon: PropTypes.any,
    /** 点击确定回调*/
    // onOk: (e: React.MouseEvent<any>) => void,
    /** 点击模态框右上角叉、取消按钮、Props.maskClosable 值为 true 时的遮罩层或键盘按下 Esc 时的回调*/
    // onCancel: (e: React.MouseEvent<any>) => void,
    afterClose: PropTypes.func.def(noop),
    /** 垂直居中 */
    centered: PropTypes.bool,
    /** 宽度*/
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    /** 底部内容*/
    footer: PropTypes.any,
    /** 确认按钮文字*/
    okText: PropTypes.any,
    /** 确认按钮类型*/
    okType: ButtonType,
    /** 取消按钮文字*/
    cancelText: PropTypes.any,
    icon: PropTypes.any,
    /** 点击蒙层是否允许关闭*/
    maskClosable: PropTypes.bool,
    /** 强制渲染 Modal*/
    forceRender: PropTypes.bool,
    okButtonProps: PropTypes.object,
    cancelButtonProps: PropTypes.object,
    destroyOnClose: PropTypes.bool,
    wrapClassName: PropTypes.string,
    maskTransitionName: PropTypes.string,
    transitionName: PropTypes.string,
    getContainer: PropTypes.func,
    zIndex: PropTypes.number,
    bodyStyle: PropTypes.object,
    maskStyle: PropTypes.object,
    mask: PropTypes.bool,
    keyboard: PropTypes.bool,
    wrapProps: PropTypes.object,
    focusTriggerAfterClose: PropTypes.bool
  };
  return initDefaultProps(props, defaultProps);
};

export const destroyFns = [];

export default defineComponent({
  name: 'AModal',
  props: modalProps({
    width: 520,
    transitionName: 'zoom',
    maskTransitionName: 'fade',
    confirmLoading: false,
    visible: false,
    okType: 'primary'
  }),
  setup(props, {emit}) {
    const instance = getCurrentInstance();
    const {value: sVisible, setValue: setVisible} = useLocalValue(!!props.visible, 'visible');
    const handleCancel = (e) => {
      setVisible(false);
      emit('cancel', e);
      emit('change', false);
    };
    const handleOk = (e) => {
      emit('ok', e);
    };
    const renderFooter = (locale) => {
      const {okType, confirmLoading} = props;
      const cancelBtnProps = mergeProps(
          {onClick: handleCancel},
          props.cancelButtonProps || {}
      );
      const okBtnProps = mergeProps(
          {
            onClick: handleOk,
            type: okType,
            loading: confirmLoading
          },
          props.okButtonProps || {}
      );
      return (
          <div>
            <Button {...cancelBtnProps}>
              {getComponentFromProp(instance, 'cancelText') || locale.cancelText}
            </Button>
            <Button {...okBtnProps}>{getComponentFromProp(instance, 'okText') || locale.okText}</Button>
          </div>
      );
    };
    return {
      sVisible, configProvider: useConfigProvider(),
      handleCancel, handleOk, renderFooter
    };
  },
  render(ctx) {
    const currentInstance = getCurrentInstance();
    const slots = this.$slots;
    const {
      prefixCls: customizePrefixCls,
      sVisible: visible,
      wrapClassName,
      centered,
      getContainer,
      $slots,
      $attrs
    } = ctx;
    const children = slots.default ? slots.default() : $slots.default;
    const {getPrefixCls, getPopupContainer: getContextPopupContainer} = this.configProvider;
    const prefixCls = getPrefixCls('modal', customizePrefixCls);

    const defaultFooter = (
        <LocaleReceiver
            componentName="Modal"
            defaultLocale={getConfirmLocale()}
            slots={{default: this.renderFooter}}
        />
    );
    const closeIcon = getComponentFromProp(currentInstance, 'closeIcon');
    const closeIconToRender = (
        <span class={`${prefixCls}-close-x`}>
          {closeIcon || <Icon class={`${prefixCls}-close-icon`} type={'close'}/>}
        </span>
    );
    const footer = getComponentFromProp(currentInstance, 'footer');
    const title = getComponentFromProp(currentInstance, 'title');
    const dialogProps = {
      ...this.$props,
      getContainer: getContainer === undefined ? getContextPopupContainer : getContainer,
      prefixCls,
      wrapClassName: classNames({[`${prefixCls}-centered`]: !!centered}, wrapClassName),
      title,
      footer: footer === undefined ? defaultFooter : footer,
      visible,
      mousePosition,
      closeIcon: closeIconToRender,
      ...getListenersFromInstance(currentInstance),
      onClose: this.handleCancel,
      class: getClassFromInstance(currentInstance),
      style: getStyleFromInstance(currentInstance),
      attrs: $attrs
    };
    return <Dialog {...dialogProps}>{children}</Dialog>;
  }
}) as any;
