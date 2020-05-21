import classNames from 'classnames';
import warning from '../_util/warning';
import Icon from '../icon';
import ActionButton from './action-button';
import {getConfirmLocale} from './locale';
import Dialog from './modal';

export default (props, {attrs}) => {
  const context = {...props, ...attrs};
  const {
    onCancel,
    onOk,
    close,
    zIndex,
    afterClose,
    visible,
    keyboard,
    centered,
    getContainer,
    maskStyle,
    okButtonProps,
    cancelButtonProps,
    iconType = 'question-circle',
    closable = false
  } = context;
  warning(
      !('iconType' in props),
      'Modal',
      `The property 'iconType' is deprecated. Use the property 'icon' instead.`
  );
  const icon = context.icon ? context.icon : iconType;
  const okType = context.okType || 'primary';
  const prefixCls = context.prefixCls || 'ant-modal';
  const contentPrefixCls = `${prefixCls}-confirm`;
  // 默认为 true，保持向下兼容
  const okCancel = 'okCancel' in props ? context.okCancel : true;
  const width = context.width || 416;
  const style = context.style || {};
  const mask = context.mask === undefined ? true : context.mask;
  // 默认为 false，保持旧版默认行为
  const maskClosable = context.maskClosable === undefined ? false : context.maskClosable;
  const runtimeLocale = getConfirmLocale();
  const okText = context.okText || (okCancel ? runtimeLocale.okText : runtimeLocale.justOkText);
  const cancelText = context.cancelText || runtimeLocale.cancelText;
  const autoFocusButton = context.autoFocusButton === null ? false : context.autoFocusButton || 'ok';
  const transitionName = context.transitionName || 'zoom';
  const maskTransitionName = context.maskTransitionName || 'fade';

  const classString = classNames(
      contentPrefixCls,
      `${contentPrefixCls}-${context.type}`,
      `${prefixCls}-${context.type}`,
      context.class
  );

  const cancelButton = okCancel && (
      <ActionButton
          actionFn={onCancel}
          closeModal={close}
          autoFocus={autoFocusButton === 'cancel'}
          buttonProps={cancelButtonProps}
      >
        {cancelText}
      </ActionButton>
  );
  const iconNode = typeof icon === 'string' ? <Icon type={icon}/> : icon(h);
  return (
      <Dialog
          prefixCls={prefixCls}
          class={classString}
          wrapClassName={classNames({[`${contentPrefixCls}-centered`]: !!centered})}
          onCancel={e => close({triggerCancel: true}, e)}
          visible={visible}
          closable={closable}
          title=""
          transitionName={transitionName}
          footer=""
          maskTransitionName={maskTransitionName}
          mask={mask}
          maskClosable={maskClosable}
          maskStyle={maskStyle}
          style={style}
          width={width}
          zIndex={zIndex}
          afterClose={afterClose}
          keyboard={keyboard}
          centered={centered}
          getContainer={getContainer}
      >
        <div class={`${contentPrefixCls}-body-wrapper`}>
          <div class={`${contentPrefixCls}-body`}>
            {iconNode}
            {context.title === undefined ? null : (
                <span class={`${contentPrefixCls}-title`}>{context.title}</span>
            )}
            <div class={`${contentPrefixCls}-content`}>
              {typeof context.content === 'function' ? context.content() : context.content}
            </div>
          </div>
          <div class={`${contentPrefixCls}-btns`}>
            {cancelButton}
            <ActionButton
                type={okType}
                actionFn={onOk}
                closeModal={close}
                autoFocus={autoFocusButton === 'ok'}
                buttonProps={okButtonProps}>
              {okText}
            </ActionButton>
          </div>
        </div>
      </Dialog>
  );
}
