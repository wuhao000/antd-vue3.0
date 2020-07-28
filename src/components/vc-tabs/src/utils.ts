import {isVNode, VNode} from 'vue';

export function toArray(children) {
  const c = [];
  children.forEach(child => {
    if (isVNode(child)) {
      c.push(child);
    }
  });
  return c;
}

export function getActiveIndex(children: VNode | VNode[], activeKey) {
  const c = toArray(children);
  for (let i = 0; i < c.length; i++) {
    if (c[i].key === activeKey) {
      return i;
    }
  }
  return -1;
}

export function setTransform(style, v) {
  style.transform = v;
  style.webkitTransform = v;
  style.mozTransform = v;
}

export function isTransform3dSupported(style) {
  return ('transform' in style || 'webkitTransform' in style
      || 'MozTransform' in style) && window.atob;
}

export function getTransformPropValue(v) {
  return {
    transform: v,
    WebkitTransform: v,
    MozTransform: v
  };
}

export function isVertical(tabBarPosition) {
  return tabBarPosition === 'left' || tabBarPosition === 'right';
}

export function getTransformByIndex(index, tabBarPosition, direction = 'ltr') {
  const translate = isVertical(tabBarPosition) ? 'translateY' : 'translateX';
  if (!isVertical(tabBarPosition) && direction === 'rtl') {
    return `${translate}(${index * 100}%) translateZ(0)`;
  }
  return `${translate}(${-index * 100}%) translateZ(0)`;
}

export function getMarginStyle(index, tabBarPosition) {
  const marginDirection = isVertical(tabBarPosition) ? 'marginTop' : 'marginLeft';
  return {
    [marginDirection]: `${-index * 100}%`
  };
}

export function getStyle(el, property) {
  return +window
      .getComputedStyle(el)
      .getPropertyValue(property)
      .replace('px', '');
}

function toNum(style, property) {
  return +style.getPropertyValue(property).replace('px', '');
}

function getTypeValue(start, current, end, tabNode, wrapperNode) {
  let total = getStyle(wrapperNode, `padding-${start}`);
  if (!tabNode || !tabNode.parentNode) {
    return total;
  }

  const {childNodes} = tabNode.parentNode;

  Array.prototype.some.call(childNodes, node => {
    if (node.nodeType === 3) {
      return false;
    }
    const style = window.getComputedStyle(node);
    if (node !== tabNode) {
      total += toNum(style, `margin-${start}`);
      total += node[current];
      total += toNum(style, `margin-${end}`);

      if (style.boxSizing === 'content-box') {
        total += toNum(style, `border-${start}-width`) + toNum(style, `border-${end}-width`);
      }
      return false;
    }

    // We need count current node margin
    // ref: https://github.com/react-component/tabs/pull/139#issuecomment-431005262
    total += toNum(style, `margin-${start}`);

    return true;
  });

  return total;
}

export function getLeft(tabNode, wrapperNode) {
  return getTypeValue('left', 'offsetWidth', 'right', tabNode, wrapperNode);
}

export function getTop(tabNode, wrapperNode) {
  return getTypeValue('top', 'offsetHeight', 'bottom', tabNode, wrapperNode);
}
