import PropTypes from '../_util/vue-types';
import Empty from '../empty';
import {ConfigConsumerProps, useConfigProvider} from './';
import { defineComponent } from 'vue';

const RenderEmpty = defineComponent({
  functional: true,
  inject: {
    configProvider: { default: () => ConfigConsumerProps }
  },
  props: {
    componentName: PropTypes.string
  },
  render(ctx) {
    const props = this.$props;
    const configProvider = useConfigProvider();
    function renderHtml(componentName) {
      const getPrefixCls = configProvider.getPrefixCls;
      const prefix = getPrefixCls('empty');
      switch (componentName) {
        case 'Table':
        case 'List':
          return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;

        case 'Select':
        case 'TreeSelect':
        case 'Cascader':
        case 'Transfer':
        case 'Mentions':
          return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} class={`${prefix}-small`} />;

        default:
          return <Empty />;
      }
    }
    return renderHtml(props.componentName);
  }
});

function renderEmpty(componentName) {
  return <RenderEmpty componentName={componentName} />;
}

export default renderEmpty;
