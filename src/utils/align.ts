import {calcOffsetToAncestor} from './offset';

export interface AlignProps {
  offset: number[];
  overflow: {
    ajustX: number;
    ajustY: number;
  };
  points: Array<'tl' | 'tr' | 'bl' | 'br'>;
}

function isWindow(obj) {
  // must use == for ie8

  /* eslint eqeqeq:0 */
  return obj !== null && obj !== undefined && obj === obj.window;
}


function getDocument(node) {
  if (isWindow(node)) {
    return node.document;
  }

  if (node.nodeType === 9) {
    return node;
  }

  return node.ownerDocument;
}

/**
 * 获取 node 上的 align 对齐点 相对于页面的坐标
 */
function getAlignOffset(region, align) {
  const V = align.charAt(0);
  const H = align.charAt(1);
  const w = region.width;
  const h = region.height;
  let x = region.left;
  let y = region.top;

  if (V === 'c') {
    y += h / 2;
  } else if (V === 'b') {
    y += h;
  }

  if (H === 'c') {
    x += w / 2;
  } else if (H === 'r') {
    x += w;
  }

  return {
    left: x,
    top: y
  };
}


const getRegion = (el: HTMLElement) => {
  const offset = calcOffsetToAncestor(el, getDocument(el));
  return {
    left: offset.left,
    top: offset.top,
    width: el.offsetWidth,
    height: el.offsetHeight
  };
};

export const alignElement = (el: HTMLElement, target: HTMLElement, align: AlignProps) => {
  const targetRegion = getRegion(target);
  el.style.left = targetRegion.left + 'px';
  el.style.top = (targetRegion.top + targetRegion.height + align.offset[1]) + 'px';
  el.style.minWidth = targetRegion.width + 'px';
};
