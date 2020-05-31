import {defineComponent, getCurrentInstance} from 'vue';
import {getComponentFromProp} from '../_util/props-util';
import PropTypes from '../_util/vue-types';
import Base from '../base';
import {ConfigConsumerProps} from '../config-provider';
import locale from '../locale-provider/default';
import DefaultEmptyImg from './empty';
import SimpleEmptyImg from './simple';

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
  inheritAttrs: false,
  props: {
    ...EmptyProps()
  },
  render(ctx) {
    const componentInstance = getCurrentInstance();
    const {prefixCls: customizePrefixCls, imageStyle} = ctx;
    const prefixCls = ConfigConsumerProps.getPrefixCls('empty', customizePrefixCls);
    const image = getComponentFromProp(componentInstance, 'image') || <DefaultEmptyImg/>;
    const description = getComponentFromProp(componentInstance, 'description');
    const des = typeof description === 'undefined' ? locale.Empty.description : description;
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
    return <div class={cls} {...this.$attrs}>
      <div class={`${prefixCls}-image`} style={imageStyle}>
        {imageNode}
      </div>
      {des && <p class={`${prefixCls}-description`}>{des}</p>},
      {this.$slots.default ? <div class={`${prefixCls}-footer`}>{this.$slots.default()}</div> : null}
    </div>;
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
