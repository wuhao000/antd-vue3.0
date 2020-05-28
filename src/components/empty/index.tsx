import {defineComponent, getCurrentInstance} from 'vue';
import {getComponentFromProp} from '../_util/props-util';
import PropTypes from '../_util/vue-types';
import Base from '../base';
import {ConfigConsumerProps} from '../config-provider';
import LocaleReceiver from '../locale-provider/locale-receiver';
import DefaultEmptyImg from './empty';
import SimpleEmptyImg from './simple';

export const TransferLocale = () => {
  return {
    description: PropTypes.string
  };
};

export const EmptyProps = () => {
  return {
    prefixCls: PropTypes.string,
    image: PropTypes.any,
    description: PropTypes.any,
    imageStyle: PropTypes.object
  };
};

const Empty = defineComponent({
  name: 'AEmpty',
  props: {
    ...EmptyProps()
  },
  setup(props, {slots}) {
    const renderEmpty = (contentLocale) => {
      const componentInstance = getCurrentInstance();
      const {prefixCls: customizePrefixCls, imageStyle} = props;
      const prefixCls = ConfigConsumerProps.getPrefixCls('empty', customizePrefixCls);
      const image = getComponentFromProp(componentInstance, 'image') || <DefaultEmptyImg/>;
      const description = getComponentFromProp(componentInstance, 'description');

      const des = typeof description !== 'undefined' ? description : contentLocale.description;
      const alt = typeof des === 'string' ? des : 'empty';
      const cls = {[prefixCls]: true};
      let imageNode = null;
      if (typeof image === 'string') {
        imageNode = <img alt={alt} src={image}/>;
      } else if (typeof image === 'object' && image.PRESENTED_IMAGE_SIMPLE) {
        const Image = image;
        imageNode = <Image/>;
        cls[`${prefixCls}-normal`] = true;
      } else {
        imageNode = image;
      }
      return <div class={cls} {...props}>
        <div class={`${prefixCls}-image`} style={imageStyle}>
          {imageNode}
        </div>
        {des && <p class={`${prefixCls}-description`}>{des}</p>},
        {slots.default ? <div class={`${prefixCls}-footer`}>{slots.default()}</div> : null}
      </div>;
    };


    return {
      renderEmpty
    };
  },
  render() {
    return <LocaleReceiver componentName="Empty" slots={{default: this.renderEmpty}}/>;
  }
}) as any;

Empty.PRESENTED_IMAGE_DEFAULT = DefaultEmptyImg;
Empty.PRESENTED_IMAGE_SIMPLE = SimpleEmptyImg;

/* istanbul ignore next */
Empty.install = function(app) {
  app.use(Base);
  app.component(Empty.name, Empty);
};

export default Empty;
