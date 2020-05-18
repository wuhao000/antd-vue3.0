import {getCurrentInstance, ref, watch} from 'vue';

export const useLocalValue = (defaultValue) => {
  const instance = getCurrentInstance();
  const localValue = ref(instance.props.value !== undefined ? instance.props.value : defaultValue);
  watch(() => instance.props.value, (value) => {
    localValue.value = value;
  });
  return {
    setValue(value, eventKey?: string) {
      const event = eventKey ? eventKey : 'update:value';
      if (instance.props.value === undefined) {
        localValue.value = value;
      } else {
        instance.emit(event, value);
      }
    },
    getValue() {
      return localValue.value;
    }
  };
};
