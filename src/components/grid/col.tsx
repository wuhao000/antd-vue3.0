import {defineComponent, h, inject} from 'vue';
import PropTypes from '../_util/vue-types';
import {ConfigConsumerProps, IConfigProvider} from '../config-provider';

const stringOrNumber = PropTypes.oneOfType([PropTypes.string, PropTypes.number]);

export const ColSize = PropTypes.shape({
  span: stringOrNumber,
  order: stringOrNumber,
  offset: stringOrNumber,
  push: stringOrNumber,
  pull: stringOrNumber
}).loose;

const objectOrNumber = PropTypes.oneOfType([PropTypes.string, PropTypes.number, ColSize]);

export const ColProps = {
  span: stringOrNumber,
  order: stringOrNumber,
  offset: stringOrNumber,
  push: stringOrNumber,
  pull: stringOrNumber,
  xs: objectOrNumber,
  sm: objectOrNumber,
  md: objectOrNumber,
  lg: objectOrNumber,
  xl: objectOrNumber,
  xxl: objectOrNumber,
  prefixCls: PropTypes.string
};

export default defineComponent({
  name: 'ACol',
  props: ColProps,
  setup() {
    const configProvider: IConfigProvider = inject('configProvider') || ConfigConsumerProps;
    const rowContext: any = inject('rowContext') || (() => null);
    return {rowContext, configProvider};
  },
  render() {
    const {
      span,
      order,
      offset,
      push,
      pull,
      prefixCls: customizePrefixCls,
      $slots,
      rowContext
    } = this;
    const getPrefixCls = this.configProvider.getPrefixCls;
    const prefixCls = getPrefixCls('col', customizePrefixCls);

    let sizeClassObj = {};
    ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'].forEach(size => {
      let sizeProps: any = {};
      const propSize = this[size];
      if (typeof propSize === 'number') {
        sizeProps.span = propSize;
      } else if (typeof propSize === 'object') {
        sizeProps = propSize || {};
      }

      sizeClassObj = {
        ...sizeClassObj,
        [`${prefixCls}-${size}-${sizeProps.span}`]: sizeProps.span !== undefined,
        [`${prefixCls}-${size}-order-${sizeProps.order}`]: sizeProps.order || sizeProps.order === 0,
        [`${prefixCls}-${size}-offset-${sizeProps.offset}`]:
        sizeProps.offset || sizeProps.offset === 0,
        [`${prefixCls}-${size}-push-${sizeProps.push}`]: sizeProps.push || sizeProps.push === 0,
        [`${prefixCls}-${size}-pull-${sizeProps.pull}`]: sizeProps.pull || sizeProps.pull === 0
      };
    });
    const classes = {
      [`${prefixCls}`]: true,
      [`${prefixCls}-${span}`]: span !== undefined,
      [`${prefixCls}-order-${order}`]: order,
      [`${prefixCls}-offset-${offset}`]: offset,
      [`${prefixCls}-push-${push}`]: push,
      [`${prefixCls}-pull-${pull}`]: pull,
      ...sizeClassObj
    };
    const divProps = {
      class: classes,
      style: {}
    };
    if (rowContext) {
      const gutter = rowContext.getGutter();
      if (gutter) {
        divProps.style = {
          ...(gutter[0] > 0
              ? {
                paddingLeft: `${gutter[0] / 2}px`,
                paddingRight: `${gutter[0] / 2}px`
              }
              : {}),
          ...(gutter[1] > 0
              ? {
                paddingTop: `${gutter[1] / 2}px`,
                paddingBottom: `${gutter[1] / 2}px`
              }
              : {})
        };
      }
    }
    return <div {...divProps}>{$slots.default && $slots.default()}</div>;
  }
}) as any;
