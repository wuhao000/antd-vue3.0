import {ComponentInternalInstance, Slot, VNode} from '@vue/runtime-core';
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

const hasProp = (instance: ComponentInternalInstance, prop): boolean => {
  return prop in instance.props;
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

const getSlots: (ele: VNode) => { [key: string]: any } = (ele: VNode) => {
  if (typeof ele.children === 'string' || Array.isArray(ele.children)) {
    return {
      default: () => ele.children
    };
  } else {
    return ele.children;
  }
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
const getOptionProps = (instance: ComponentInternalInstance): any => {
  return instance.props;
};

const getComponentFromProp = (instance: ComponentInternalInstance, prop, options: any = instance, execute = true) => {
  if (!instance) {
    return undefined;
  }
  const temp = instance.props[prop];
  if (temp !== undefined) {
    return typeof temp === 'function' && execute ? temp(options) : temp;
  }
  return (
      (instance.slots[prop] && execute && instance.slots[prop](options)) ||
      instance.slots[prop] || undefined
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

const getAttrs = (ele: VNode) => {
  return ele.props;
};

const getKey = ele => {
  let key = ele.key;
  if (ele.$vnode) {
    key = ele.$vnode.key;
  }
  return key;
};

export function getEvents(child: VNode) {
  return getListenersFromProps(child.props);
}

// use getListeners instead this.$listeners
// https://github.com/vueComponent/ant-design-vue/issues/1705

export function getListenersFromInstance(instance: ComponentInternalInstance) {
  const context = {...instance.props, ...instance.attrs};
  return getListenersFromProps(context);
}

export function getListenersFromVNode(node: VNode) {
  return getListenersFromProps(node.props);
}

export function getListenersFromProps(context: object) {
  const keys = Object.keys(context);
  const listeners: any = {};
  keys.forEach(key => {
    if (/^on[A-Z]+/.test(key)) {
      listeners[key] = context[key];
    }
  });
  return listeners;
}

export function getClassFromInstance(instance: ComponentInternalInstance) {
  return instance.attrs.class;
}

export function getClassFromVNode(ele: VNode) {
  return ele.props.class;
}

export function getStyle(ele: ComponentInternalInstance) {
  return ele.attrs.style;
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
    let items: any[] = children();
    if (items.length === 1 && typeof items[0].type === 'symbol' && items[0].type.description === 'Fragment') {
      items = items[0].children;
    }
    // if (items.length === 1 && items[0].type === FRAGMENT)
    return items.filter(c => !isEmptyElement(c));
  }
  return [];
}

const initDefaultProps = <PropsOptions = ComponentObjectPropsOptions>(propTypes: PropsOptions, defaultProps): any => {
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
      element['__v_isVNode'] &&
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
