import { ref } from 'vue';

export const useCommonMixin = (props) => {
  const focusElement = ref(null);
  const rootInstance = ref(null);
  return {
    focusElement,
    rootInstance,
    setRootInstance(el) {
      rootInstance.value = el
    },
    getFormat() {
      let {format} = props;
      const {locale, timePicker} = props;
      if (!format) {
        if (timePicker) {
          format = locale.dateTimeFormat;
        } else {
          format = locale.dateFormat;
        }
      }
      return format;
    },
    focus() {
      if (focusElement.value) {
        focusElement.value.focus();
      } else if (rootInstance.value) {
        rootInstance.value.focus();
      }
    },
    saveFocusElement(ele) {
      focusElement.value = ele;
    }
  };
};
