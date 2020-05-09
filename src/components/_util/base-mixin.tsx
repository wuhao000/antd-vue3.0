import { ComponentInternalInstance, getCurrentInstance } from '@vue/runtime-core';

export default (instance: ComponentInternalInstance) => {
  return {
    __emit(...args) {
      // 直接调用listeners，底层组件不需要vueTool记录events
      const eventName = args[0];
      const eventHandlerName = `on${eventName.substr(0, 1).toUpperCase()}${eventName.substr(1)}`;
      const eventHandler = instance.attrs[eventHandlerName] as any;
      if (args.length && eventHandler) {
        if (Array.isArray(eventHandler)) {
          for (let i = 0, l = eventHandler.length; i < l; i++) {
            eventHandler[i](...args.slice(1));
          }
        } else {
          eventHandler(...args.slice(1));
        }
      }
    }
  };
};
