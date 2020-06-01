import {isFragment} from '@/components/_util/props-util';
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

export function cloneElement(n: VNode | VNode[], nodeProps: any = {}, deep: boolean = false)
    : any {
  if (Array.isArray(n)) {
    return n.map(item => cloneElement(item, nodeProps));
  }
  if (isFragment(n)) {
    const newFragmentNode = cloneVNode(n, nodeProps);
    if (n.children) {
      if (n.children.length === 1) {
        return cloneVNode(n.children[0], nodeProps);
      }
      newFragmentNode.children = cloneElement(n.children as VNode[], nodeProps);
    }
    return newFragmentNode;
  }
  const {children} = nodeProps;
  const clonedNode = cloneVNode(n, nodeProps);
  if (children) {
    if (Array.isArray(children) && deep) {
      clonedNode.children = cloneElement(children);
    } else {
      clonedNode.children = children;
    }
  }
  return clonedNode;
}

export function addEvent(node: VNode, event: string, callback) {
  if (!node.props) {
    node.props = {};
  }
  if (node.props[event]) {
    node.props[event] = [node.props[event], callback];
  } else {
    node.props[event] = callback;
  }
}
