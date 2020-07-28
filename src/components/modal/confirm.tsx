import Omit from 'omit.js';
import {createApp} from 'vue';
import ConfirmDialog from './confirm-dialog';
import {destroyFns} from './modal';

export default function confirm(config) {
  const div = document.createElement('div');
  const el = document.createElement('div');
  div.appendChild(el);
  document.body.appendChild(div);
  let currentConfig = {...Omit(config, ['parentContext']), close, visible: true};

  let confirmDialogInstance = null;
  const confirmDialogProps = {};

  function close(...args) {
    destroy(...args);
  }

  function update(newConfig) {
    currentConfig = {
      ...currentConfig,
      ...newConfig
    };
    Object.assign(confirmDialogProps, currentConfig);
  }

  function destroy(...args) {
    if (confirmDialogInstance && div.parentNode) {
      confirmDialogInstance.unmount();
      confirmDialogInstance = null;
      div.parentNode.removeChild(div);
    }
    const triggerCancel = args.some(param => param && param.triggerCancel);
    if (config.onCancel && triggerCancel) {
      config.onCancel(...args);
    }
    for (let i = 0; i < destroyFns.length; i++) {
      const fn = destroyFns[i];
      if (fn === close) {
        destroyFns.splice(i, 1);
        break;
      }
    }
  }

  function render(props) {
    const finalProps = Object.assign({}, confirmDialogProps, props);
    return <ConfirmDialog {...finalProps} />;
  }

  confirmDialogInstance = createApp(render, {
    ...currentConfig,
    getContainer: () => {
      return el;
    }
  });
  confirmDialogInstance.config.warnHandler = (m) => {
  };
  confirmDialogInstance.mount(el);
  destroyFns.push(close);
  return {
    destroy: close,
    update
  };
}
