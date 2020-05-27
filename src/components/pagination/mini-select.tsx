import {getCurrentInstance} from 'vue';
import {filterEmpty, getListenersFromInstance, getOptionProps} from '../_util/props-util';
import VcSelect, {SelectProps} from '../select';

export default {
  props: {
    ...SelectProps
  },
  Option: VcSelect.Option,
  render() {
    const instance = getCurrentInstance();
    const selectOptionsProps = getOptionProps(this);
    const selelctProps = {
      ...selectOptionsProps,
      size: 'small',
      ...getListenersFromInstance(instance)
    };
    return <VcSelect {...selelctProps}>{filterEmpty(this.$slots.default)}</VcSelect>;
  }
};
