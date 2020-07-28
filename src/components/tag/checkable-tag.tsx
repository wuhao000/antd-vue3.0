import {useLocalValue} from '@/tools/value';
import {computed} from 'vue';
import PropTypes from '../_util/vue-types';
import {useConfigProvider} from '../config-provider';

export default {
  name: 'ACheckableTag',
  props: {
    prefixCls: PropTypes.string,
    checked: Boolean
  },
  setup(props, {emit}) {
    const {value, setValue, getValue} = useLocalValue(false, 'checked');
    const configProvider = useConfigProvider();
    const classes = computed(() => {
      const {prefixCls: customizePrefixCls} = props;
      const getPrefixCls = configProvider.getPrefixCls;
      const prefixCls = getPrefixCls('tag', customizePrefixCls);
      return {
        [`${prefixCls}`]: true,
        [`${prefixCls}-checkable`]: true,
        [`${prefixCls}-checkable-checked`]: value.value
      };
    });
    const handleClick = () => {
      const checked = getValue();
      setValue(!checked);
      emit('change', !checked);
    };
    return {
      classes, handleClick, value
    };
  },
  render(ctx) {
    const {classes, handleClick, $slots} = ctx;
    return (
        <div class={classes} onClick={handleClick}>
          {$slots.default && $slots.default()}
        </div>
    );
  }
};
