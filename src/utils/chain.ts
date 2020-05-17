export function chaining(...fns) {
  return function(...args) {
    // eslint-disable-line
    // eslint-disable-line
    for (let i = 0; i < fns.length; i++) {
      if (fns[i] && typeof fns[i] === 'function') {
        fns[i].apply(chaining, args);
      }
    }
  };
}
