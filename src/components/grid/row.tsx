import {defineComponent, h, inject, nextTick, onBeforeUnmount, onMounted, provide, ref} from 'vue';
import ResponsiveObserve from '../_util/responsive-observe';
import PropTypes from '../_util/vue-types';
import {ConfigConsumerProps} from '../config-provider';

const RowProps = {
  gutter: PropTypes.oneOfType([PropTypes.object, PropTypes.number, PropTypes.array]).def(0),
  type: PropTypes.oneOf(['flex']),
  align: PropTypes.oneOf(['top', 'middle', 'bottom', 'stretch']),
  justify: PropTypes.oneOf(['start', 'end', 'center', 'space-around', 'space-between']),
  prefixCls: PropTypes.string
};

const responsiveArray = ['xxl', 'xl', 'lg', 'md', 'sm', 'xs'];

export default defineComponent({
  name: 'ARow',
  props: RowProps,
  setup(props) {
    const screens = ref([]);
    const configProvider = inject('configProvider') || ConfigConsumerProps;
    const token = ref<any>(() => null);
    onMounted(() => {
      nextTick(() => {
        token.value = ResponsiveObserve.subscribe(screens => {
          const {gutter} = props;
          if (
              typeof gutter === 'object' ||
              (Array.isArray(gutter) &&
                  (typeof gutter[0] === 'object' || typeof gutter[1] === 'object'))
          ) {
            screens.value = screens;
          }
        });
      });
    });
    onBeforeUnmount(() => {
      ResponsiveObserve.unsubscribe(token.value);
    });
    const getGutter = () => {
      const results = [0, 0];
      const {gutter} = props;
      const normalizedGutter = Array.isArray(gutter) ? gutter : [gutter, 0];
      normalizedGutter.forEach((g, index) => {
        if (typeof g === 'object') {
          for (let i = 0; i < responsiveArray.length; i++) {
            const breakpoint = responsiveArray[i];
            if (screens[breakpoint] && g[breakpoint] !== undefined) {
              results[index] = g[breakpoint];
              break;
            }
          }
        } else {
          results[index] = g || 0;
        }
      });
      return results;
    };
    provide('rowContext', {getGutter});
    return {configProvider, getGutter};
  },
  render(ctx) {
    const {type, justify, align, prefixCls: customizePrefixCls, $slots} = this;
    const getPrefixCls = ctx.configProvider.getPrefixCls;
    const prefixCls = getPrefixCls('row', customizePrefixCls);
    const gutter = this.getGutter();
    const classes = {
      [prefixCls]: !type,
      [`${prefixCls}-${type}`]: type,
      [`${prefixCls}-${type}-${justify}`]: type && justify,
      [`${prefixCls}-${type}-${align}`]: type && align
    };
    const rowStyle = {
      ...(gutter[0] > 0
          ? {
            marginLeft: `${gutter[0] / -2}px`,
            marginRight: `${gutter[0] / -2}px`
          }
          : {}),
      ...(gutter[1] > 0
          ? {
            marginTop: `${gutter[1] / -2}px`,
            marginBottom: `${gutter[1] / -2}px`
          }
          : {})
    };
    return <div class={classes} style={rowStyle}>
      {$slots.default && $slots.default()}
    </div>;
  }
}) as any;
