import Empty from '../empty';
import {useConfigProvider} from './';

const RenderEmpty = (props: { componentName: string }) => {
  const configProvider = useConfigProvider();

  function renderHtml(componentName) {
    const getPrefixCls = configProvider.getPrefixCls;
    const prefix = getPrefixCls('empty');
    switch (componentName) {
      case 'Table':
      case 'List':
        return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}/>;
      case 'Select':
      case 'TreeSelect':
      case 'Cascader':
      case 'Transfer':
      case 'Mentions':
        return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} class={`${prefix}-small`}/>;
      default:
        return <Empty/>;
    }
  }

  return renderHtml(props.componentName);
};

export default (componentName) => {
  return <RenderEmpty componentName={componentName}/>;
}
