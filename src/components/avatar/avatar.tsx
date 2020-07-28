import {CSSProperties, defineComponent, getCurrentInstance, nextTick, onMounted, onUpdated, ref, watch} from 'vue';
import {getComponentFromProp, getListenersFromInstance} from '../_util/props-util';
import PropTypes from '../_util/vue-types';
import {useConfigProvider} from '../config-provider';
import Icon from '../icon';

const AvatarProps = {
  prefixCls: {
    type: String,
    default: undefined
  },
  shape: {
    validator: (val: string) => ['circle', 'square'].includes(val),
    default: 'circle'
  },
  size: {
    validator: val => {
      return typeof val === 'number' || ['small', 'large', 'default'].includes(val as string);
    },
    default: 'default'
  },
  src: String,
  /** Srcset of image avatar */
  srcSet: String,
  icon: PropTypes.any,
  alt: String,
  loadError: Function
};

export default defineComponent({
  name: 'AAvatar',
  props: AvatarProps,
  setup(props) {
    const isImgExist = ref(true);
    const scale = ref(1);
    const lastChildrenWidth = ref(undefined);
    const lastNodeWidth = ref(undefined);
    const avatarNode = ref(undefined);
    const isMounted = ref(false);
    const avatarChildren = ref(undefined);
    watch(() => props.src, (val) => {
      nextTick(() => {
        isImgExist.value = true;
        scale.value = 1;
      });
    });
    const setScale = () => {
      if (!avatarChildren.value || !avatarNode.value) {
        return;
      }
      const childrenWidth = avatarChildren.value.offsetWidth; // offsetWidth avoid affecting be transform scale
      const nodeWidth = avatarNode.value.offsetWidth;
      // denominator is 0 is no meaning
      if (
          childrenWidth === 0 ||
          nodeWidth === 0 ||
          (lastChildrenWidth.value === childrenWidth && lastNodeWidth.value === nodeWidth)
      ) {
        return;
      }
      lastChildrenWidth.value = childrenWidth;
      lastNodeWidth.value = nodeWidth;
      // add 4px gap for each side to get better performance
      scale.value = nodeWidth - 8 < childrenWidth ? (nodeWidth - 8) / childrenWidth : 1;
    };
    const handleImgLoadError = () => {
      const {loadError} = props;
      const errorFlag = loadError ? loadError() : undefined;
      if (errorFlag !== false) {
        isImgExist.value = false;
      }
    };
    onMounted(() => {
      nextTick(() => {
        setScale();
        isMounted.value = true;
      });
    });
    onUpdated(() => {
      nextTick(() => {
        setScale();
      });
    });

    return {
      setScale,
      isImgExist,
      scale,
      handleImgLoadError,
      isMounted,
      configProvider: useConfigProvider(),
      setChildren(el) {
        avatarChildren.value = el;
      },
      setAvatarNode(el) {
        avatarNode.value = el;
      }
    };
  },
  render(ctx) {
    const instance = getCurrentInstance();
    const {prefixCls: customizePrefixCls, shape, size, src, alt, srcSet} = ctx;
    const icon = getComponentFromProp(instance, 'icon');
    const getPrefixCls = this.configProvider.getPrefixCls;
    const prefixCls = getPrefixCls('avatar', customizePrefixCls);

    const sizeCls = {
      [`${prefixCls}-lg`]: size === 'large',
      [`${prefixCls}-sm`]: size === 'small'
    };

    const classString = {
      [prefixCls]: true,
      ...sizeCls,
      [`${prefixCls}-${shape}`]: shape,
      [`${prefixCls}-image`]: src && ctx.isImgExist,
      [`${prefixCls}-icon`]: icon
    };

    const sizeStyle =
        typeof size === 'number'
            ? {
              width: `${size}px`,
              height: `${size}px`,
              lineHeight: `${size}px`,
              fontSize: icon ? `${size / 2}px` : '18px'
            }
            : {};

    let children: any = ctx.$slots.default && ctx.$slots.default();
    if (src && ctx.isImgExist) {
      children = <img src={src} srcset={srcSet} onError={this.handleImgLoadError} alt={alt}/>;
    } else if (icon) {
      if (typeof icon === 'string') {
        children = <Icon type={icon}/>;
      } else {
        children = icon;
      }
    } else {
      const childrenNode = this.$refs.avatarChildren;
      if (childrenNode || ctx.scale !== 1) {
        const transformString = `scale(${ctx.scale}) translateX(-50%)`;
        const childrenStyle = {
          msTransform: transformString,
          WebkitTransform: transformString,
          transform: transformString
        };
        const sizeChildrenStyle =
            typeof size === 'number'
                ? {
                  lineHeight: `${size}px`
                }
                : {};
        children = (
            <span
                class={`${prefixCls}-string`}
                ref={ctx.setChildren}
                style={{...sizeChildrenStyle, ...childrenStyle}}>
            {children}
          </span>
        );
      } else {
        const childrenStyle: CSSProperties = {};
        if (!ctx.isMounted.value) {
          childrenStyle.opacity = 0;
        }
        children = (
            <span class={`${prefixCls}-string`} ref="avatarChildren" style={{opacity: 0}}>
            {children}
          </span>
        );
      }
    }
    return (
        <span ref={ctx.setAvatarNode} {...{
          ...getListenersFromInstance(instance),
          class: classString,
          style: sizeStyle
        }}>
        {children}
      </span>
    );
  }
}) as any;
