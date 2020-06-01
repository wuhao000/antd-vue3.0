import {defineComponent} from 'vue';
import PropTypes from '../_util/vue-types';
import Base from '../base';
import {useConfigProvider} from '../config-provider';

const Divider = defineComponent({
  name: 'ADivider',
  props: {
    prefixCls: PropTypes.string,
    type: PropTypes.oneOf(['horizontal', 'vertical', '']).def('horizontal'),
    dashed: PropTypes.bool,
    orientation: PropTypes.oneOf(['left', 'right', 'center'])
  },
  setup() {
    return {
      configProvider: useConfigProvider()
    };
  },
  render() {
    const {prefixCls: customizePrefixCls, type, $slots, dashed, orientation = 'center'} = this;
    const getPrefixCls = this.configProvider.getPrefixCls;
    const prefixCls = getPrefixCls('divider', customizePrefixCls);
    const orientationPrefix = orientation.length > 0 ? '-' + orientation : orientation;
    const classString = {
      [prefixCls]: true,
      [`${prefixCls}-${type}`]: true,
      [`${prefixCls}-with-text${orientationPrefix}`]: $slots.default,
      [`${prefixCls}-dashed`]: !!dashed
    };

    return (
        <div class={classString} role="separator">
          {$slots.default && <span class={`${prefixCls}-inner-text`}>{$slots.default}</span>}
        </div>
    );
  }
}) as any;

/* istanbul ignore next */
Divider.install = function(Vue) {
  Vue.use(Base);
  Vue.component(Divider.name, Divider);
};

export default Divider;
