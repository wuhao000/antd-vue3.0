export function easeInOutCubic(t, b, c, d) {
  let copyT = t;
  const cc = c - b;
  copyT /= d / 2;
  if (copyT < 1) {
    return (cc / 2) * copyT * copyT * copyT + b;
  }
  return (cc / 2) * ((copyT -= 2) * copyT * copyT + 2) + b;
}
