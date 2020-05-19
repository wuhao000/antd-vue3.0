import {getCurrentInstance, ref, watch} from 'vue';

export const useLocalValue = (defaultValue?: any, propName?: string = 'value') => {
  const instance = getCurrentInstance();
  const localValue = ref(instance.props['propName'] !== undefined ? instance.props['propName'] : defaultValue);
  watch(() => instance.props[propName], (value) => {
    localValue.value = value;
  });
  return {
    setValue(value, eventKey?: string | (() => any)) {
      let event: string = null;
      if (typeof eventKey === 'string') {
        event = eventKey ? eventKey : `update:${propName}`;
      } else {
        event = `update:${propName}`;
      }
      if (instance.props[propName] === undefined) {
        localValue.value = value;
      } else {
        instance.emit(event, value);
      }
      if (typeof eventKey === 'function') {
        eventKey();
      }
    },
    getValue() {
      return localValue.value;
    }
  };
};
