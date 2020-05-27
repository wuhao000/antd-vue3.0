import {getListenersFromInstance} from '@/components/_util/props-util';
import {defineComponent, getCurrentInstance} from 'vue';
import PropTypes from '../_util/vue-types';
import {useConfigProvider} from '../config-provider';

export default defineComponent({
  name: 'ACardGrid',
  __ANT_CARD_GRID: true,
  props: {
    prefixCls: PropTypes.string,
    hoverable: PropTypes.bool
  },
  setup() {
    return {
      configProvider: useConfigProvider()
    };
  },
  render(ctx
  ) {
    const {prefixCls: customizePrefixCls, hoverable = true} = ctx.$props;

    const getPrefixCls = ctx.configProvider.getPrefixCls;
    const prefixCls = getPrefixCls('card', customizePrefixCls);

    const classString = {
      [`${prefixCls}-grid`]: true,
      [`${prefixCls}-grid-hoverable`]: hoverable
    };
    const instance = getCurrentInstance();
    return (
        <div {...getListenersFromInstance(instance)} class={classString}>
          {ctx.$slots.default && ctx.$slots.default()}
        </div>
    );
  }
});
