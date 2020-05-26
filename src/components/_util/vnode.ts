import {ComponentInternalInstance} from '@vue/runtime-core';
import classNames from 'classnames';
import {chaining} from '../../utils/chain';
import {cloneVNode, VNode} from 'vue';
import {filterEmpty, parseStyleText} from './props-util';

export function addListener(instance: ComponentInternalInstance, event: string, callback: (...args: any[]) => any) {
  let obj = instance.attrs;
  const originEventListener = obj[event];
  if (originEventListener) {
    obj[event] = chaining(originEventListener, callback);
  } else {
    obj[event] = callback;
  }
}


export function cloneElement(n: VNode, nodeProps: any, deep: boolean = false) {
  return cloneVNode(n, nodeProps);
}

export function addEvent(node: VNode, event: string, callback) {
  if (node.props[event]) {
    node.props[event] = [node.props[event], callback];
  } else {
    node.props[event] = callback;
  }
}
