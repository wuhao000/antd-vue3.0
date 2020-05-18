import {getCurrentInstance, ref, watch} from 'vue';

const useLocalValue = (defaultValue) => {
  const instance = getCurrentInstance();
  const localValue = ref(instance.props.value !== undefined ? instance.props.value : defaultValue);
  watch(() => instance.props.value, (value) => {
    localValue.value = value;
  });
  return {
    setValue(value, eventKey) {
      if (instance.props.value === undefined) {
        localValue.value = value;
      } else {
        instance.emit(eventKey, value);
      }
    },
    getValue() {
      return localValue.value;
    }
  };
};
