import {defineComponent, getCurrentInstance, ref} from 'vue';
import {getListenersFromInstance} from '../_util/props-util';
import Checkbox from '../checkbox';
import Radio from '../radio';
import {SelectionBoxProps} from './interface';

export default defineComponent({
  name: 'SelectionBox',
  props: SelectionBoxProps,
  setup(props, {emit}) {
    const getCheckState = () => {
      const {store, defaultSelection, rowIndex} = props;
      let localChecked: boolean;
      if (store.getState().selectionDirty) {
        localChecked = store.getState().selectedRowKeys.indexOf(rowIndex) >= 0;
      } else {
        localChecked =
            store.getState().selectedRowKeys.indexOf(rowIndex) >= 0 ||
            defaultSelection.indexOf(rowIndex) >= 0;
      }
      return localChecked;
    };
    const checked = ref(getCheckState());
    return {
      checked,
      getCheckState
    };
  },
  render(ctx) {
    const instance = getCurrentInstance();
    const {type, rowIndex, ...rest} = ctx;
    const {checked} = ctx;
    const checkboxProps = {
      checked,
      ...rest,
      ...getListenersFromInstance(instance)
    };
    if (type === 'radio') {
      checkboxProps.value = rowIndex;
      return <Radio {...checkboxProps} />;
    }
    return <Checkbox {...checkboxProps} />;
  }
}) as any;
