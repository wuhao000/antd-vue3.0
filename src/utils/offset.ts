function getOffsetPosition(element: HTMLElement, rootEl: HTMLElement) {
  let tmp: HTMLElement = element;
  let left = 0;
  let top = 0;
  while (tmp && tmp !== rootEl) {
    left += tmp.offsetLeft;
    top += tmp.offsetTop;
    tmp = tmp.offsetParent as HTMLElement;
  }
  return {left, top};
}

function getAncestorsUtil(element: HTMLElement,
                          rootEl: HTMLElement) {
  let tmp: HTMLElement = element;
  let left = 0;
  let top = 0;
  while (tmp && tmp !== rootEl) {
    left += tmp.scrollLeft;
    top += tmp.scrollTop;
    tmp = tmp.parentElement;
  }
  return {left, top};
}

export const calcOffsetToAncestor = (element: HTMLElement,
                                     rootEl: HTMLElement): {
  left: number,
  top: number
} => {
  const offset = getOffsetPosition(element, rootEl);
  const scrollOffset = getAncestorsUtil(element, rootEl);
  return {
    left: offset.left - scrollOffset.left, top: offset.top - scrollOffset.top
  };
};
