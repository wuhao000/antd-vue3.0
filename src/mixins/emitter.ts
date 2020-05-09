import {ComponentInternalInstance} from '@vue/runtime-core';
import { getCurrentInstance } from 'vue';

export const useEmitter = (instance: ComponentInternalInstance) => {
  return {
    dispatch(componentName: string, eventName: any, params?: any[]) {
      let parent = instance.parent || instance.root;
      let name = parent.vnode.type['name'];
      while (parent && (!name || name !== componentName)) {
        parent = parent.parent;
        if (parent) {
          name = parent.vnode.type['name'];
        }
      }
      if (parent) {
        instance.emit.apply(parent, params ? [eventName].concat(params) as any : [eventName]);
      }
    },
    broadcast(componentName, eventName, params) {
      this.$children.forEach(child => {
        const name = child.$options.componentName;
        if (name === componentName) {
          child.$emit.apply(child, [eventName].concat(params));
        } else {
          broadcast.apply(child, [componentName, eventName].concat([params]) as any);
        }
      });
    }
  };
};

