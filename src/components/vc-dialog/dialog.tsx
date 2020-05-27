import {
  defineComponent,
  getCurrentInstance,
  nextTick,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  Transition,
  watch
} from 'vue';
import getTransitionProps from '../_util/getTransitionProps';
import KeyCode from '../_util/keycode';
import {getComponentFromProp, initDefaultProps} from '../_util/props-util';
import switchScrollingEffect from '../_util/switchScrollingEffect';
import contains from '../vc-util/Dom/contains';
import getDialogPropTypes from './IDialogPropTypes';

const IDialogPropTypes = getDialogPropTypes();

let uuid = 0;

function noop() {
}

function getScroll(w, top?) {
  let ret = w[`page${top ? 'Y' : 'X'}Offset`];
  const method = `scroll${top ? 'Top' : 'Left'}`;
  if (typeof ret !== 'number') {
    const d = w.document;
    ret = d.documentElement[method];
    if (typeof ret !== 'number') {
      ret = d.body[method];
    }
  }
  return ret;
}

function setTransformOrigin(node, value) {
  const style = node.style;
  ['Webkit', 'Moz', 'Ms', 'ms'].forEach(prefix => {
    style[`${prefix}TransformOrigin`] = value;
  });
  style[`transformOrigin`] = value;
}

function offset(el) {
  const rect = el.getBoundingClientRect();
  const pos = {
    left: rect.left,
    top: rect.top
  };
  const doc = el.ownerDocument;
  const w = doc.defaultView || doc.parentWindow;
  pos.left += getScroll(w);
  pos.top += getScroll(w, true);
  return pos;
}

let cacheOverflow: any = {};

export default defineComponent({
  props: initDefaultProps(IDialogPropTypes, {
    mask: true,
    visible: false,
    keyboard: true,
    closable: true,
    maskClosable: true,
    destroyOnClose: false,
    prefixCls: 'rc-dialog',
    getOpenCount: () => null,
    focusTriggerAfterClose: true
  }),
  setup(props, {emit, slots}) {
    const instance = getCurrentInstance();
    const destroyPopup = ref(false);
    const inTransition = ref(false);
    const wrapRef = ref(undefined);
    const titleId = ref(`rcDialogTitle${uuid++}`);
    const dialogRef = ref(undefined);
    const openTime = ref(null);
    const lastOutSideFocusNode = ref(undefined);
    const sentinelStartRef = ref(undefined);
    const timeoutId = ref(null);
    const sentinelEndRef = ref(null);
    const dialogMouseDown = ref(false);
    const setSentinelStart = (el) => {
      sentinelStartRef.value = el;
    };
    const tryFocus = () => {
      if (!contains(wrapRef.value, document.activeElement)) {
        lastOutSideFocusNode.value = document.activeElement;
        sentinelStartRef.value.focus();
      }
    };
    const onDialogMouseDown = () => {
      dialogMouseDown.value = true;
    };
    const close = (e) => {
      emit('close', e);
    };
    const getTransitionName = () => {
      let transitionName = props.transitionName;
      const animation = props.animation;
      if (!transitionName && animation) {
        transitionName = `${props.prefixCls}-${animation}`;
      }
      return transitionName;
    };
    const getZIndexStyle = () => {
      const style: any = {};
      if (props.zIndex !== undefined) {
        style.zIndex = props.zIndex;
      }
      return style;
    };
    const onAnimateLeave = () => {
      const {afterClose, destroyOnClose} = props;
      // need demo?
      // https://github.com/react-component/dialog/pull/28
      if (wrapRef.value) {
        wrapRef.value.style.display = 'none';
      }
      if (destroyOnClose) {
        destroyPopup.value = true;
      }
      inTransition.value = false;
      switchScrollingEffect();
      if (afterClose) {
        afterClose();
      }
    };
    const getMaskStyle = () => {
      return {...getZIndexStyle(), ...props.maskStyle};
    };
    const getMaskTransitionName = () => {
      let transitionName = props.maskTransitionName;
      const animation = props.maskAnimation;
      if (!transitionName && animation) {
        transitionName = `${props.prefixCls}-${animation}`;
      }
      return transitionName;
    };
    const updatedCallback = (visible) => {
      const mousePosition = props.mousePosition;
      const {mask, focusTriggerAfterClose} = props;
      if (props.visible) {
        // first show
        if (!visible) {
          openTime.value = Date.now();
          // this.lastOutSideFocusNode = document.activeElement
          switchScrollingEffect();
          // this.$refs.wrap.focus()
          tryFocus();
          const dialogNode = dialogRef.value;
          if (mousePosition) {
            const elOffset = offset(dialogNode);
            setTransformOrigin(
                dialogNode,
                `${mousePosition.x - elOffset.left}px ${mousePosition.y - elOffset.top}px`
            );
          } else {
            setTransformOrigin(dialogNode, '');
          }
        }
      } else if (visible) {
        inTransition.value = true;
        if (mask && lastOutSideFocusNode.value && focusTriggerAfterClose) {
          try {
            lastOutSideFocusNode.value.focus();
          } catch (e) {
            lastOutSideFocusNode.value = null;
          }
          lastOutSideFocusNode.value = null;
        }
      }
    };
    provide('dialogContext', instance);
    watch(() => props.visible, (val) => {
      if (val) {
        destroyPopup.value = false;
      }
      nextTick(() => {
        updatedCallback(!val);
      });
    });
    onMounted(() => {
      nextTick(() => {
        updatedCallback(false);
        // if forceRender is true, set element style display to be none;
        if ((props.forceRender || (props.getContainer === false && !props.visible)) && wrapRef.value) {
          wrapRef.value.style.display = 'none';
        }
      });
    });
    onBeforeUnmount(() => {
      const {visible, getOpenCount} = props;
      if ((visible || inTransition.value) && !getOpenCount()) {
        switchScrollingEffect();
      }
      clearTimeout(timeoutId.value);
    });
    return {
      destroyPopup,
      // 对外暴露的 api 不要更改名称或删除
      updatedCallback,
      tryFocus,
      onAnimateLeave,
      onMaskMouseUp() {
        if (dialogMouseDown.value) {
          timeoutId.value = setTimeout(() => {
            dialogMouseDown.value = false;
          }, 0);
        }
      },
      onMaskClick(e) {
        // android trigger click on open (fastclick??)
        if (Date.now() - openTime.value < 300) {
          return;
        }
        if (e.target === e.currentTarget && !dialogMouseDown.value) {
          close(e);
        }
      },
      onKeydown(e) {
        if (props.keyboard && e.keyCode === KeyCode.ESC) {
          e.stopPropagation();
          close(e);
          return;
        }
        // keep focus inside dialog
        if (props.visible) {
          if (e.keyCode === KeyCode.TAB) {
            const activeElement = document.activeElement;
            const tmpSentinelStart = sentinelStartRef.value;
            if (e.shiftKey) {
              if (activeElement === tmpSentinelStart) {
                sentinelEndRef.value.focus();
              }
            } else if (activeElement === sentinelEndRef.value) {
              tmpSentinelStart.focus();
            }
          }
        }
      },
      getDialogElement() {
        const {
          closable,
          prefixCls,
          width,
          height,
          title,
          footer: tempFooter,
          bodyStyle,
          visible,
          bodyProps
        } = props;
        const dest: any = {};
        if (width !== undefined) {
          dest.width = typeof width === 'number' ? `${width}px` : width;
        }
        if (height !== undefined) {
          dest.height = typeof height === 'number' ? `${height}px` : height;
        }

        let footer;
        if (tempFooter) {
          footer = (
              <div key="footer" class={`${prefixCls}-footer`} ref="footer">
                {tempFooter}
              </div>
          );
        }

        let header;
        if (title) {
          header = (
              <div key="header" class={`${prefixCls}-header`} ref="header">
                <div class={`${prefixCls}-title`} id={titleId.value}>
                  {title}
                </div>
              </div>
          );
        }

        let closer;
        if (closable) {
          const closeIcon = getComponentFromProp(getCurrentInstance(), 'closeIcon');
          closer = (
              <button
                  type="button"
                  key="close"
                  onClick={close || noop}
                  aria-label="Close"
                  class={`${prefixCls}-close`}>
                {closeIcon || <span class={`${prefixCls}-close-x`}/>}
              </button>
          );
        }

        const style = {...props.dialogStyle, ...dest};
        const sentinelStyle = {width: 0, height: 0, overflow: 'hidden'};
        const cls = {
          [prefixCls]: true,
          ...props.dialogClass
        };
        const transitionName = getTransitionName();
        const dialogElement = (
            <div
                v-show={visible}
                key="dialog-element"
                role="document"
                ref={(el) => dialogRef.value = el}
                style={style}
                class={cls}
                onMousedown={onDialogMouseDown}
            >
              <div tabindex={0} ref={setSentinelStart} style={sentinelStyle} aria-hidden="true"/>
              <div class={`${prefixCls}-content`}>
                {closer}
                {header}
                <div key="body" class={`${prefixCls}-body`} style={bodyStyle} ref="body" {...bodyProps}>
                  {slots.default && slots.default()}
                </div>
                {footer}
              </div>
              <div tabindex={0} ref={(el) => sentinelEndRef.value = el} style={sentinelStyle} aria-hidden="true"/>
            </div>
        );
        const dialogTransitionProps = getTransitionProps(transitionName, {
          onAfterLeave: onAnimateLeave
        });
        return (
            <Transition key="dialog" {...dialogTransitionProps}>
              {visible || !destroyPopup.value ? dialogElement : null}
            </Transition>
        );
      },
      getWrapStyle() {
        return {...getZIndexStyle(), ...props.wrapStyle};
      },
      getMaskElement() {
        let maskElement;
        if (props.mask) {
          const maskTransition = getMaskTransitionName();
          maskElement = (
              <div v-show={props.visible}
                   style={getMaskStyle()}
                   key="mask"
                   class={`${props.prefixCls}-mask`}/>
          );
          if (maskTransition) {
            const maskTransitionProps = getTransitionProps(maskTransition);
            maskElement = (
                <Transition key="mask" {...maskTransitionProps}>
                  {maskElement}
                </Transition>
            );
          }
        }
        return maskElement;
      },
      getTransitionName,
      // setScrollbar() {
      //   if (this.bodyIsOverflowing && this.scrollbarWidth !== undefined) {
      //     document.body.style.paddingRight = `${this.scrollbarWidth}px`;
      //   }
      // },
      switchScrollingEffect() {
        const {getOpenCount} = props;
        const openCount = getOpenCount();
        if (openCount === 1) {
          if (cacheOverflow.hasOwnProperty('overflowX')) {
            return;
          }
          cacheOverflow = {
            overflowX: document.body.style.overflowX,
            overflowY: document.body.style.overflowY,
            overflow: document.body.style.overflow
          };
          switchScrollingEffect();
          // Must be set after switchScrollingEffect
          document.body.style.overflow = 'hidden';
        } else if (!openCount) {
          // IE browser doesn't merge overflow style, need to set it separately
          // https://github.com/ant-design/ant-design/issues/19393
          if (cacheOverflow.overflow !== undefined) {
            document.body.style.overflow = cacheOverflow.overflow;
          }
          if (cacheOverflow.overflowX !== undefined) {
            document.body.style.overflowX = cacheOverflow.overflowX;
          }
          if (cacheOverflow.overflowY !== undefined) {
            document.body.style.overflowY = cacheOverflow.overflowY;
          }
          cacheOverflow = {};
          switchScrollingEffect(true);
        }
      },
      // removeScrollingEffect() {
      //   const { getOpenCount } = this;
      //   const openCount = getOpenCount();
      //   if (openCount !== 0) {
      //     return;
      //   }
      //   document.body.style.overflow = '';
      //   switchScrollingEffect(true);
      //   // this.resetAdjustments();
      // },
      close,
      setWrap: (el) => {
        wrapRef.value = el;
      },
      titleId
    };
  },
  render(ctx) {
    const {prefixCls, maskClosable, visible, wrapClassName, title, wrapProps} = this;
    const style = this.getWrapStyle();
    // clear hide display
    // and only set display after async anim, not here for hide
    if (visible) {
      style.display = null;
    }
    return (
        <div class={`${prefixCls}-root`}>
          {this.getMaskElement()}
          <div
              v-show={ctx.visible}
              tabIndex={-1}
              onKeydown={this.onKeydown}
              class={`${prefixCls}-wrap ${wrapClassName || ''}`}
              ref={ctx.setWrap}
              onClick={maskClosable ? this.onMaskClick : noop}
              onMouseup={maskClosable ? this.onMaskMouseUp : noop}
              role="dialog"
              aria-labelledby={title ? ctx.titleId : null}
              style={style}
              {...wrapProps}>
            {this.getDialogElement()}
          </div>
        </div>
    );
  }
}) as any;
