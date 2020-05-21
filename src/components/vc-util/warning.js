/* eslint-disable no-console */
let warned = {};

export function warning (valid, message) {
  // Support uglify
  if (process.env.NODE_ENV !== 'production' && !valid && console !== undefined) {
    console.error(`Warning: ${message}`);
  }
}

export function note(valid, message) {
  // Support uglify
  if (process.env.NODE_ENV !== 'production' && !valid && console !== undefined) {
    console.warn(`Note: ${message}`);
  }
}

export function resetWarned() {
  warned = {};
}

export function call(method, valid, message) {
  if (!valid && !warned[message]) {
    method(false, message);
    warned[message] = true;
  }
}

export function warningOnce(valid, message) {
  call(warning, valid, message);
}

export function noteOnce(valid, message) {
  call(note, valid, message);
}

export default warningOnce;
/* eslint-enable */
