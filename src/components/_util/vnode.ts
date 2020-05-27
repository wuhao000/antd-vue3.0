import {ComponentInternalInstance} from '@vue/runtime-core';
import {cloneVNode, VNode} from 'vue';
import {chaining} from '../../utils/chain';

export function addListener(instance: ComponentInternalInstance, event: string, callback: (...args: any[]) => any) {
  let obj = instance.attrs;
  const originEventListener = obj[event];
  if (originEventListener) {
    obj[event] = chaining(originEventListener, callback);
  } else {
    obj[event] = callback;
  }
}


export function cloneElement(n: VNode | VNode[], nodeProps: any, deep: boolean = false) {
  if (Array.isArray(n)) {
    return n.map(item => cloneVNode(item, nodeProps));
  }
  const {children} = nodeProps;
  const clonedNode = cloneVNode(n, nodeProps);
  if (children) {
    clonedNode.children = children;
  }
  return clonedNode;
}

export function addEvent(node: VNode, event: string, callback) {
  if (node.props[event]) {
    node.props[event] = [node.props[event], callback];
  } else {
    node.props[event] = callback;
  }
}
