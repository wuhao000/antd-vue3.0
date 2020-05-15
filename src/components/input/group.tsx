import {defineComponent, inject} from 'vue';
import {filterEmpty} from '../_util/props-util';
import PropTypes from '../_util/vue-types';
import {ConfigConsumerProps, IConfigProvider} from '../config-provider';

interface ButtonGroupProps {
  prefixCls?: string;
  size?: 'small' | 'large' | 'default';
  compact?: boolean;
}

const buttonGroupProps: any = {
  prefixCls: PropTypes.string,
  size: {
    validator(value: string) {
      return ['small', 'large', 'default'].includes(value);
    }
  },
  compact: Boolean
};
export default defineComponent({
  name: 'AInputGroup',
  props: buttonGroupProps,
  setup(props: ButtonGroupProps) {
    const configProvider: IConfigProvider = inject('configProvider') || ConfigConsumerProps;
    const {prefixCls: customizePrefixCls, size, compact = false} = props;
    const classes = () => {
      const getPrefixCls = configProvider.getPrefixCls;
      const prefixCls = getPrefixCls('input-group', customizePrefixCls);

      return {
        [`${prefixCls}`]: true,
        [`${prefixCls}-lg`]: size === 'large',
        [`${prefixCls}-sm`]: size === 'small',
        [`${prefixCls}-compact`]: compact
      };
    };
    return {configProvider, classes};
  },
  render() {
    return (
        <span class={this.classes()}>
          {filterEmpty(this.$slots.default)}
        </span>
    );
  }
});
