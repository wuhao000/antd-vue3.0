import {defineComponent, h} from 'vue';
import {mergeProps} from '../_util/props-util';
import Icon from './index';

const customCache = new Set();

export default function create(options) {
  const {scriptUrl, extraCommonProps = {}} = options;

  /**
   * DOM API required.
   * Make sure in browser environment.
   * The Custom Icon will create a <script/>
   * that loads SVG symbols and insert the SVG Element into the document body.
   */
  if (
      typeof document !== 'undefined' &&
      typeof window !== 'undefined' &&
      typeof document.createElement === 'function' &&
      typeof scriptUrl === 'string' &&
      scriptUrl.length &&
      !customCache.has(scriptUrl)
  ) {
    const script = document.createElement('script');
    script.setAttribute('src', scriptUrl);
    script.setAttribute('data-namespace', scriptUrl);
    customCache.add(scriptUrl);
    document.body.appendChild(script);
  }

  const iconfont = defineComponent({
    name: 'AIconfont',
    props: Icon.props,
    render(context) {
      const {props, slots, listeners, data} = context;
      const {type, ...restProps} = props;
      const slotsMap = slots();
      const children = slotsMap.default;
      // component > children > type
      let content = null;
      if (type) {
        // @ts-ignore
        return <use {...{['xlink:href']: `#${type}`}}/>;
      }
      if (children) {
        content = children;
      }
      const iconProps = mergeProps(extraCommonProps, data, {props: restProps, on: listeners});
      return <Icon {...iconProps}>{context}</Icon>;
    }
  });
  return iconfont;
}
