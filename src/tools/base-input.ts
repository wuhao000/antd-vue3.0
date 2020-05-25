import {useForm} from '@/components/form/src/form';
import {getCurrentInstance} from 'vue';

export const useBaseInput = () => {
  const {labelWidth, registerControl, registerField, unRegisterField} = useForm();
  const instance = getCurrentInstance();
  registerControl();
  return {
    instance,
    labelWidth,
    registerField,
    unRegisterField,
    _emit(eventName: string, ...args: any[]) {
      const fnName = `on${eventName.substr(0, 1).toUpperCase()}${eventName.substr(1)}`;
      if (instance.attrs[fnName]) {
        (instance.attrs[fnName] as any)(...args);
      } else {
        instance.emit(eventName, ...args);
      }
    }
  };
};
