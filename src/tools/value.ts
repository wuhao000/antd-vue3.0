import {getCurrentInstance, ref, watch} from 'vue';

const isNullOrUndefined = (value) => {
  return value === undefined || value === null;
};

const basicTypes = ['number', 'boolean', 'string'];

function isEqual(a, b) {
  if (isNullOrUndefined(a) && isNullOrUndefined(b)) {
    return true;
  } else if (isNullOrUndefined(a) || isNullOrUndefined(b)) {
    return false;
  }
  const compareA = basicTypes.includes(typeof a) ? a.toString() : a;
  const compareB = basicTypes.includes(typeof b) ? b.toString() : b;
  return compareA === compareB;
}

export const useLocalValue = (defaultValue?: any, propName: string = 'value', options: {
  transform: (value: any) => any,
  reverseTransform: (value: any) => any
} = {
  transform: v => v,
  reverseTransform: v => v
}) => {
  const context = {
    doAfterSetValue: null,
    doBeforeSetValue: null
  };
  const instance = getCurrentInstance();
  const localValue = ref(isNullOrUndefined(instance.props[propName]) ? options.transform(defaultValue) : options.transform(instance.props[propName]));
  watch(() => instance.props[propName], (value) => {
    const newValue = options.transform(value);
    if (!isEqual(localValue.value, newValue)) {
      localValue.value = newValue;
    }
  });
  return {
    afterValueSetAction(callback) {
      context.doAfterSetValue = callback;
    },
    setBeforeAction(callback) {
      context.doBeforeSetValue = callback;
    },
    setValue(value, eventKeyOrCallback?: string | (() => any)) {
      if (context.doBeforeSetValue) {
        context.doBeforeSetValue(value);
      }
      let event: string = null;
      if (typeof eventKeyOrCallback === 'string') {
        event = eventKeyOrCallback ? eventKeyOrCallback : `update:${propName}`;
      } else {
        event = `update:${propName}`;
      }
      if (instance.props[propName] === undefined) {
        localValue.value = value;
      } else {
        instance.emit(event, options.reverseTransform(value));
      }
      if (typeof eventKeyOrCallback === 'function') {
        eventKeyOrCallback();
      }
      if (context.doAfterSetValue) {
        context.doAfterSetValue(value);
      }
    },
    getValue() {
      return localValue.value;
    },
    value: localValue
  };
};
