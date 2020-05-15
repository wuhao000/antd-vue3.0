import {ComponentInternalInstance} from '@vue/runtime-core';
import classNames from 'classnames';
import {createVNode, VNode} from 'vue';
import {filterEmpty, parseStyleText} from './props-util';

export function addListener(instance: ComponentInternalInstance, event: string, callback: Function) {
  const originEventListener = instance.attrs[event];
  if (originEventListener) {
    instance.attrs[event] = [originEventListener, callback];
  } else {
    instance.attrs[event] = callback;
  }
}


export function cloneVNode(vnode: VNode, deep: boolean) {
  const cloned = createVNode(vnode.type, vnode.props, vnode.children);
  cloned.key = vnode.key;
  cloned.anchor = vnode.anchor;
  cloned.appContext = vnode.appContext;
  cloned.component = vnode.component;
  cloned.dynamicProps = vnode.dynamicProps;
  if (deep) {
    if (vnode.children) {
      cloned.children = cloneVNodes(vnode.children, true);
    }
  }
  return cloned;
}

export function cloneVNodes(vnodes: any, deep: boolean = false) {
  if (typeof vnodes === 'string') {
    return vnodes;
  }
  const len = vnodes.length;
  const res = new Array(len);
  for (let i = 0; i < len; i++) {
    res[i] = cloneVNode(vnodes[i], deep);
  }
  return res;
}

export function cloneElement(n: VNode, nodeProps: any, deep: boolean = false) {
  let ele = n;
  if (Array.isArray(n)) {
    ele = filterEmpty(n)[0];
  }
  if (!ele) {
    return null;
  }
  const node = cloneVNode(ele, deep);
  // // 函数式组件不支持clone  https://github.com/vueComponent/ant-design-vue/pull/1947
  // warning(
  //   !(node.fnOptions && node.fnOptions.functional),
  //   `can not use cloneElement for functional component (${node.fnOptions && node.fnOptions.name})`,
  // );
  const {props = {}, key, on = {}, children, directives = []} = nodeProps;
  const data = node.data || {};
  let cls = {};
  let style = {};
  const {
    attrs = {},
    ref,
    domProps = {},
    style: tempStyle = {},
    class: tempCls = {},
    scopedSlots = {}
  } = nodeProps;

  if (typeof data.style === 'string') {
    style = parseStyleText(data.style);
  } else {
    style = {...data.style, ...style};
  }
  if (typeof tempStyle === 'string') {
    style = {...style, ...parseStyleText(style)};
  } else {
    style = {...style, ...tempStyle};
  }

  if (typeof data.class === 'string' && data.class.trim() !== '') {
    data.class.split(' ').forEach(c => {
      cls[c.trim()] = true;
    });
  } else if (Array.isArray(data.class)) {
    classNames(data.class)
        .split(' ')
        .forEach(c => {
          cls[c.trim()] = true;
        });
  } else {
    cls = {...data.class, ...cls};
  }
  if (typeof tempCls === 'string' && tempCls.trim() !== '') {
    tempCls.split(' ').forEach(c => {
      cls[c.trim()] = true;
    });
  } else {
    cls = {...cls, ...tempCls};
  }
  node.data = Object.assign({}, data, {
    style,
    attrs: {...data.attrs, ...attrs},
    class: cls,
    domProps: {...data.domProps, ...domProps},
    scopedSlots: {...data.scopedSlots, ...scopedSlots},
    directives: [...(data.directives || []), ...directives]
  });

  if (node.componentOptions) {
    node.componentOptions.propsData = node.componentOptions.propsData || {};
    node.componentOptions.listeners = node.componentOptions.listeners || {};
    node.componentOptions.propsData = {...node.componentOptions.propsData, ...props};
    node.componentOptions.listeners = {...node.componentOptions.listeners, ...on};
    if (children) {
      node.componentOptions.children = children;
    }
  } else {
    node.data.on = {...(node.data.on || {}), ...on};
  }

  if (key !== undefined) {
    node.key = key;
    node.data.key = key;
  }
  if (typeof ref === 'string') {
    node.data.ref = ref;
  }
  return node;
}

export function addEvent(node: VNode, event: string, callback) {
  if (node.props[event]) {
    node.props[event] = [node.props[event], callback];
  } else {
    node.props[event] = callback;
  }
}
