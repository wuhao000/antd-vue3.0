import {ref, defineComponent, getCurrentInstance, nextTick} from 'vue';
import {ConfigConsumerProps, useConfigProvider} from '../config-provider';
import PropTypes from '../_util/vue-types';

export default defineComponent({
  name: 'ABreadcrumbSeparator',
  props: {
    prefixCls: PropTypes.string,
  },
  setup() {
    return {
      configProvider: useConfigProvider()
    };
  },
  render() {
    const {prefixCls: customizePrefixCls, $slots} = this;
    const getPrefixCls = this.configProvider.getPrefixCls;
    const prefixCls = getPrefixCls('breadcrumb', customizePrefixCls);
    const children = $slots.default && $slots.default();
    return <span class={`${prefixCls}-separator`}>{children || '/'}</span>;
  },
});
