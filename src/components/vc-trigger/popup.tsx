import {preventDefaultEvent} from '@/components/select/utils';
import classnames from 'classnames';
import {
  defineComponent,
  getCurrentInstance,
  nextTick,
  onBeforeUnmount,
  onBeforeUpdate,
  onMounted,
  onUpdated,
  ref,
  Transition
} from 'vue';
import animate from '../_util/css-animation';
import {getListeners} from '../_util/props-util';
import PropTypes from '../_util/vue-types';
import Align from '../vc-align';
import LazyRenderBox from './lazy-render-box';
import PopupInner from './popup-inner';

export default defineComponent({
  name: 'VCTriggerPopup',
  props: {
    visible: PropTypes.bool,
    getClassNameFromAlign: PropTypes.func,
    getRootDomNode: PropTypes.func,
    align: PropTypes.any,
    destroyPopupOnHide: PropTypes.bool,
    prefixCls: PropTypes.string,
    getContainer: PropTypes.func,
    transitionName: PropTypes.string,
    animation: PropTypes.any,
    maskAnimation: PropTypes.string,
    maskTransitionName: PropTypes.string,
    mask: PropTypes.bool,
    zIndex: PropTypes.number,
    popupClassName: PropTypes.any,
    popupStyle: PropTypes.object.def(() => ({})),
    stretch: PropTypes.string,
    point: PropTypes.shape({
      pageX: PropTypes.number,
      pageY: PropTypes.number
    })
  },
  setup(props, {slots, attrs}) {
    const componentInstance = getCurrentInstance();
    const domEl = ref(null);
    const rootNode = ref(null);
    const currentAlignClassName = ref(null);
    const stretchChecked = ref(false);
    const targetHeight = ref(null);
    const targetWidth = ref(null);
    const popupInstanceRef = ref(null);
    const alignInstanceRef = ref(null);
    onMounted(() => {
      nextTick(() => {
        rootNode.value = getPopupDomNode();
        setStretchSize();
      });
    });
    const onAlign = (popupDomNode, align) => {
      const alignClassName = props.getClassNameFromAlign(align);
      // FIX: https://github.com/react-component/trigger/issues/56
      // FIX: https://github.com/react-component/tooltip/issues/79
      if (currentAlignClassName.value !== alignClassName) {
        currentAlignClassName.value = alignClassName;
        popupDomNode.className = getClassName(alignClassName);
      }
      const listeners = getListeners(this);
      listeners.align && listeners.align(popupDomNode, align);
    };

    // Record size if stretch needed
    const setStretchSize = () => {
      const {stretch, getRootDomNode, visible} = props;

      if (!stretch || !visible) {
        if (stretchChecked) {
          stretchChecked.value = false;
        }
        return;
      }

      const $ele = getRootDomNode();
      if (!$ele) {
        return;
      }

      const height = $ele.offsetHeight;
      const width = $ele.offsetWidth;

      if (targetHeight !== height || targetWidth !== width || !stretchChecked) {
        stretchChecked.value = true;
        targetHeight.value = height;
        targetWidth.value = width;
      }
    };

    const getPopupDomNode = () => {
      return popupInstanceRef.value ? popupInstanceRef.value : null;
    };

    const getTargetElement = () => {
      return props.getRootDomNode();
    };

    // `target` on `rc-align` can accept as a function to get the bind element or a point.
    // ref: https://www.npmjs.com/package/rc-align
    const getAlignTarget = () => {
      const {point} = props;
      if (point) {
        return point;
      }
      return getTargetElement;
    };

    const getMaskTransitionName = () => {
      let transitionName = props.maskTransitionName;
      const animation = props.maskAnimation;
      if (!transitionName && animation) {
        transitionName = `${props.prefixCls}-${animation}`;
      }
      return transitionName;
    };

    const getTransitionName = () => {
      let transitionName = props.transitionName;
      const animation = props.animation;
      if (!transitionName) {
        if (typeof animation === 'string') {
          transitionName = `${animation}`;
        } else if (animation && animation.props && animation.props.name) {
          transitionName = animation.props.name;
        }
      }
      return transitionName;
    };

    const getClassName = (currentAlignClassName) => {
      return classnames(`${props.prefixCls} ${props.popupClassName} ${currentAlignClassName}`,
        props.popupClassName);
    };
    const getPopupElement = () => {
      const {
        align,
        visible,
        prefixCls,
        animation,
        popupStyle,
        getClassNameFromAlign,
        destroyPopupOnHide,
        stretch
      } = props;
      const className = getClassName(
        currentAlignClassName.value || getClassNameFromAlign(align)
      );
      // const hiddenClassName = `${prefixCls}-hidden`
      if (!visible) {
        currentAlignClassName.value = null;
      }
      const sizeStyle: any = {};
      if (stretch) {
        // Stretch with target
        if (stretch.indexOf('height') !== -1) {
          sizeStyle.height = typeof targetHeight === 'number' ? `${targetHeight}px` : targetHeight;
        } else if (stretch.indexOf('minHeight') !== -1) {
          sizeStyle.minHeight =
            typeof targetHeight === 'number' ? `${targetHeight}px` : targetHeight;
        }
        if (stretch.indexOf('width') !== -1) {
          sizeStyle.width = typeof targetWidth === 'number' ? `${targetWidth}px` : targetWidth;
        } else if (stretch.indexOf('minWidth') !== -1) {
          sizeStyle.minWidth = typeof targetWidth === 'number' ? `${targetWidth}px` : targetWidth;
        }
        // Delay force align to makes ui smooth
        if (!stretchChecked) {
          // sizeStyle.visibility = 'hidden'
          setTimeout(() => {
            if (alignInstanceRef.value) {
              alignInstanceRef.value.forceAlign();
            }
          }, 0);
        }
      }
      const popupInnerProps = {
        class: className,
        ...getListeners(attrs),
        ref: (el) => {
          popupInstanceRef.value = el;
        },
        style: {...sizeStyle, ...getZIndexStyle()}
      };
      let transitionProps: any = {
        appear: true,
        css: false
      };
      const transitionName = getTransitionName();
      let useTransition = !!transitionName;
      const transitionEvent = {
        onBeforeEnter: () => {
          // el.style.display = el.__vOriginalDisplay
          // this.$refs.alignInstance.forceAlign();
        },
        onEnter: (el, done) => {
          // render 后 vue 会移除通过animate动态添加的 class导致动画闪动，延迟两帧添加动画class，可以进一步定位或者重写 transition 组件
          nextTick(() => {
            if (alignInstanceRef.value) {
              nextTick(() => {
                domEl.value = el;
                animate(el, `${transitionName}-enter`, done);
              });
            }
          });
        },
        onBeforeLeave: () => {
          domEl.value = null;
        },
        onLeave: (el, done) => {
          animate(el, `${transitionName}-leave`, done);
        }
      };

      if (typeof animation === 'object') {
        useTransition = true;
        const {on = {}, props = {}} = animation;
        Object.assign(transitionProps, props);
        Object.assign(transitionProps, {...transitionEvent, ...on});
      } else {
        Object.assign(transitionProps, transitionEvent);
      }
      if (!useTransition) {
        transitionProps = {};
      }
      if (destroyPopupOnHide) {
        return (
          <Transition {...transitionProps}>
            <Align
              target={getAlignTarget()}
              key="popup"
              ref={(el) => {
                alignInstanceRef.value = el;
              }}
              monitorWindowResize={true}
              align={align}
              onAlign={onAlign}>
              <PopupInner v-show={visible.value} {...popupInnerProps}>{slots.default()}</PopupInner>
            </Align>
          </Transition>
        );
      }
      return (
        <Transition {...transitionProps}>
          <Align
            target={getAlignTarget()}
            key="popup"
            ref="alignInstance"
            monitorWindowResize={true}
            disabled={!visible}
            align={align}
            onAlign={onAlign}>
            <div v-show={visible.value} {...popupInnerProps}>
              <div onMousedown={preventDefaultEvent} class={`${prefixCls}-content`}>
                {slots.default()}
              </div>
            </div>
          </Align>
        </Transition>
      );
    };

    const getZIndexStyle = () => {
      const style: any = {};
      if (props.zIndex !== undefined) {
        style.zIndex = props.zIndex;
      }
      return style;
    };

    const getMaskElement = () => {
      let maskElement = null;
      if (props.mask) {
        const maskTransition = getMaskTransitionName();
        maskElement = (
          <LazyRenderBox
            v-show={props.visible}
            style={getZIndexStyle()}
            key="mask"
            class={`${props.prefixCls}-mask`}
            visible={props.visible}
          />
        );
        if (maskTransition) {
          maskElement = (
            <transition appear={true} name={maskTransition}>
              {maskElement}
            </transition>
          );
        }
      }
      return maskElement;
    };
    onBeforeUpdate(() => {
      if (domEl.value && domEl.value.rcEndListener) {
        domEl.value.rcEndListener();
        domEl.value = null;
      }
    });
    onUpdated(() => {
      nextTick(() => {
        setStretchSize();
      });
    });
    onBeforeUnmount(() => {
      if (componentInstance.vnode.el.parentNode) {
        componentInstance.vnode.el.parentNode.removeChild(getCurrentInstance().vnode.el);
      } else if (componentInstance.vnode.el.remove) {
        componentInstance.vnode.el.remove();
      }
    });
    return {
      // Used for stretch
      stretchChecked,
      targetWidth,
      targetHeight,
      getMaskElement,
      getPopupElement,
      rootNode
    };
  },
  render() {
    const {getMaskElement, getPopupElement} = this;
    return (
      <div>
        {getMaskElement()}
        {getPopupElement()}
      </div>
    );
  }
}) as any;
