import {defineComponent, inject} from 'vue';
import {filterEmpty} from '../_util/props-util';
import PropTypes from '../_util/vue-types';
import {ConfigConsumerProps, IConfigProvider} from '../config-provider';

const ButtonGroupProps = {
  prefixCls: PropTypes.string,
  size: {
    validator(value) {
      return ['small', 'large', 'default'].includes(value);
    }
  }
};
export {ButtonGroupProps};
export default defineComponent({
  name: 'AButtonGroup',
  props: ButtonGroupProps,
  setup() {
    const configProvider: IConfigProvider = inject('configProvider') || ConfigConsumerProps;
    return {configProvider};
  },
  render() {
    const {prefixCls: customizePrefixCls, size, $slots} = this;
    const getPrefixCls = this.configProvider.getPrefixCls;
    const prefixCls = getPrefixCls('btn-group', customizePrefixCls);

    // large => lg
    // small => sm
    let sizeCls = '';
    switch (size) {
      case 'large':
        sizeCls = 'lg';
        break;
      case 'small':
        sizeCls = 'sm';
        break;
      default:
        break;
    }
    const classes = {
      [`${prefixCls}`]: true,
      [`${prefixCls}-${sizeCls}`]: sizeCls
    };
    return <div class={classes}>{filterEmpty($slots.default)}</div>;
  }
});
