import {ComponentInternalInstance, Slot, VNode} from '@vue/runtime-core';
import classNames from 'classnames';
import isPlainObject from 'lodash/isPlainObject';
import {ComponentObjectPropsOptions} from 'vue';

function getType(fn) {
  const match = fn && fn.toString().match(/^\s*function (\w+)/);
  return match ? match[1] : '';
}

const camelizeRE = /-(\w)/g;
const camelize = str => {
  return str.replace(camelizeRE, (_, c) => (c ? c.toUpperCase() : ''));
};
const parseStyleText = (cssText = '', camel) => {
  const res = {};
  const listDelimiter = /;(?![^(]*\))/g;
  const propertyDelimiter = /:(.+)/;
  cssText.split(listDelimiter).forEach(function(item) {
    if (item) {
      const tmp = item.split(propertyDelimiter);
      if (tmp.length > 1) {
        const k = camel ? camelize(tmp[0].trim()) : tmp[0].trim();
        res[k] = tmp[1].trim();
      }
    }
  });
  return res;
};

const hasProp = (instance, prop): boolean => {
  const $options = instance.$options || {};
  const propsData = $options.propsData || {};
  return prop in propsData;
};
const slotHasProp = (slot, prop) => {
  const $options = slot.componentOptions || {};
  const propsData = $options.propsData || {};
  return prop in propsData;
};
const filterProps = (props, propsData = {}) => {
  const res = {};
  Object.keys(props).forEach(k => {
    if (k in propsData || props[k] !== undefined) {
      res[k] = props[k];
    }
  });
  return res;
};

const getScopedSlots = ele => {
  return (ele.data && ele.data.scopedSlots) || {};
};

const getSlots = ele => {
  let componentOptions = ele.componentOptions || {};
  if (ele.$vnode) {
    componentOptions = ele.$vnode.componentOptions || {};
  }
  const children = ele.children || componentOptions.children || [];
  const slots = {};
  children.forEach(child => {
    if (!isEmptyElement(child)) {
      const name = (child.data && child.data.slot) || 'default';
      slots[name] = slots[name] || [];
      slots[name].push(child);
    }
  });
  return {...slots, ...getScopedSlots(ele)};
};
const getSlot = (self, name = 'default', options = {}) => {
  return (
      (self.$scopedSlots && self.$scopedSlots[name] && self.$scopedSlots[name](options)) ||
      self.$slots[name] ||
      []
  );
};

const getAllChildren = ele => {
  let componentOptions = ele.componentOptions || {};
  if (ele.$vnode) {
    componentOptions = ele.$vnode.componentOptions || {};
  }
  return ele.children || componentOptions.children || [];
};
const getSlotOptions = ele => {
  if (ele.fnOptions) {
    // 函数式组件
    return ele.fnOptions;
  }
  let componentOptions = ele.componentOptions;
  if (ele.$vnode) {
    componentOptions = ele.$vnode.componentOptions;
  }
  return componentOptions ? componentOptions.Ctor.options || {} : {};
};
const getOptionProps = instance => {
  if (instance.componentOptions) {
    const componentOptions = instance.componentOptions;
    const {propsData = {}, Ctor = {}} = componentOptions;
    const props: { [key: string]: any } = (Ctor.options || {}).props || {};
    const res = {};
    for (const [k, v] of Object.entries(props)) {
      const def = v.default;
      if (def !== undefined) {
        res[k] =
            typeof def === 'function' && getType(v.type) !== 'Function' ? def.call(instance) : def;
      }
    }
    return {...res, ...propsData};
  }
  const {$options = {}, $props = {}} = instance;
  return filterProps($props, $options.propsData);
};

const getComponentFromProp = (instance: ComponentInternalInstance, prop, options: any = instance, execute = true) => {
  const temp = instance.props[prop];
  if (temp !== undefined) {
    return typeof temp === 'function' && execute ? temp(options) : temp;
  }
  return (
      (instance.slots[prop] && execute && instance.slots[prop](options)) ||
      instance.slots[prop] ||
      instance.slots[prop] ||
      undefined
  );
};

const getAllProps = ele => {
  let data = ele.data || {};
  let componentOptions = ele.componentOptions || {};
  if (ele.$vnode) {
    data = ele.$vnode.data || {};
    componentOptions = ele.$vnode.componentOptions || {};
  }
  return {...data.props, ...data.attrs, ...componentOptions.propsData};
};

const getPropsData = ele => {
  let componentOptions = ele.componentOptions;
  if (ele.$vnode) {
    componentOptions = ele.$vnode.componentOptions;
  }
  return componentOptions ? componentOptions.propsData || {} : {};
};
const getValueByProp = (ele, prop) => {
  return getPropsData(ele)[prop];
};

const getAttrs = ele => {
  let data = ele.data;
  if (ele.$vnode) {
    data = ele.$vnode.data;
  }
  return data ? data.attrs || {} : {};
};

const getKey = ele => {
  let key = ele.key;
  if (ele.$vnode) {
    key = ele.$vnode.key;
  }
  return key;
};

export function getEvents(child) {
  let events = {};
  if (child.componentOptions && child.componentOptions.listeners) {
    events = child.componentOptions.listeners;
  } else if (child.data && child.data.on) {
    events = child.data.on;
  }
  return {...events};
}
// use getListeners instead this.$listeners
// https://github.com/vueComponent/ant-design-vue/issues/1705
export function getListeners(context) {
  const keys = Object.keys(context);
  const listeners: any = {};
  keys.forEach(key => {
    if (/^on[A-Z]+/.test(key)) {
      listeners[key] = context[key];
    }
  });
  return listeners;
}

export function getClass(ele) {
  let data: any = {};
  if (ele.data) {
    data = ele.data;
  } else if (ele.$vnode && ele.$vnode.data) {
    data = ele.$vnode.data;
  }
  const tempCls = data.class || {};
  const staticClass = data.staticClass;
  let cls = {};
  staticClass &&
  staticClass.split(' ').forEach(c => {
    cls[c.trim()] = true;
  });
  if (typeof tempCls === 'string') {
    tempCls.split(' ').forEach(c => {
      cls[c.trim()] = true;
    });
  } else if (Array.isArray(tempCls)) {
    classNames(tempCls)
        .split(' ')
        .forEach(c => {
          cls[c.trim()] = true;
        });
  } else {
    cls = {...cls, ...tempCls};
  }
  return cls;
}

export function getStyle(ele, camel) {
  let data: any = {};
  if (ele.data) {
    data = ele.data;
  } else if (ele.$vnode && ele.$vnode.data) {
    data = ele.$vnode.data;
  }
  let style = data.style || data.staticStyle;
  if (typeof style === 'string') {
    style = parseStyleText(style, camel);
  } else if (camel && style) {
    // 驼峰化
    const res = {};
    Object.keys(style).forEach(k => (res[camelize(k)] = style[k]));
    return res;
  }
  return style;
}

export function getComponentName(opts) {
  return opts && (opts.Ctor.options.name || opts.tag);
}

export function isEmptyElement(c: VNode) {
  return !(c.type || (c.children && c.children.length !== 0));
}

export function isStringElement(c) {
  return !c.tag;
}

export function filterEmpty(children: Slot | undefined) {
  if (children !== undefined) {
    return children().filter(c => !isEmptyElement(c));
  }
  return [];
}

const initDefaultProps = <PropsOptions = ComponentObjectPropsOptions>(propTypes: PropsOptions, defaultProps) => {
  Object.keys(defaultProps).forEach(k => {
    if (propTypes[k]) {
      propTypes[k].def && (propTypes[k] = propTypes[k].def(defaultProps[k]));
    } else {
      throw new Error(`not have ${k} prop`);
    }
  });
  return propTypes;
};

export function mergeProps(...args: any[]): any {
  const props = {};
  args.forEach((p = {}) => {
    for (const [k, v] of Object.entries(p)) {
      props[k] = props[k] || {};
      if (isPlainObject(v)) {
        Object.assign(props[k], v);
      } else {
        props[k] = v;
      }
    }
  });
  return props;
}

function isValidElement(element) {
  return (
      element &&
      typeof element === 'object' &&
      'component' in element &&
      element.type !== undefined
  ); // remove text node
}

export {
  hasProp,
  filterProps,
  getOptionProps,
  getComponentFromProp,
  getSlotOptions,
  slotHasProp,
  getPropsData,
  getKey,
  getAttrs,
  getValueByProp,
  parseStyleText,
  initDefaultProps,
  isValidElement,
  camelize,
  getSlots,
  getSlot,
  getAllProps,
  getAllChildren
};
export default hasProp;
