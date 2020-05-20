import {
  cloneVNode,
  defineComponent,
  getCurrentInstance,
  inject,
  nextTick,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  provide,
  ref,
  Teleport,
  VNode,
  watch
} from 'vue';
import BaseMixin from '../_util/base-mixin';
import {filterEmpty, getComponentFromProp, getListeners} from '../_util/props-util';
import {cancelAnimationTimeout, requestAnimationTimeout} from '../_util/requestAnimationTimeout';
import PropTypes from '../_util/vue-types';
import warning from '../_util/warning';
import addEventListener from '../vc-util/Dom/addEventListener';
import contains from '../vc-util/Dom/contains';
import Popup from './popup';
import {getAlignFromPlacement, getAlignPopupClassName, noop} from './utils';

function returnEmptyString() {
  return '';
}

function returnDocument() {
  return window.document;
}

const ALL_HANDLERS = [
  'click',
  'mousedown',
  'touchstart',
  'mouseenter',
  'mouseleave',
  'focus',
  'blur',
  'contextmenu'
];

export default defineComponent({
  name: 'Trigger',
  props: {
    action: PropTypes.oneOfType([PropTypes.string,
      PropTypes.arrayOf(PropTypes.string)]).def([]),
    showAction: PropTypes.any.def([]),
    hideAction: PropTypes.any.def([]),
    getPopupClassNameFromAlign: PropTypes.any.def(returnEmptyString),
    afterPopupVisibleChange: PropTypes.func.def(noop),
    popup: PropTypes.any,
    popupStyle: PropTypes.object.def(() => ({})),
    prefixCls: PropTypes.string.def('rc-trigger-popup'),
    popupClassName: PropTypes.string.def(''),
    popupPlacement: PropTypes.string,
    builtinPlacements: PropTypes.object,
    popupTransitionName: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    popupAnimation: PropTypes.any,
    mouseEnterDelay: PropTypes.number.def(0),
    mouseLeaveDelay: PropTypes.number.def(0.1),
    zIndex: PropTypes.number,
    focusDelay: PropTypes.number.def(0),
    blurDelay: PropTypes.number.def(0.15),
    getPopupContainer: PropTypes.func,
    getDocument: PropTypes.func.def(() => returnDocument),
    forceRender: PropTypes.bool,
    destroyPopupOnHide: PropTypes.bool.def(false),
    mask: PropTypes.bool.def(false),
    maskClosable: PropTypes.bool.def(true),
    // onPopupAlign: PropTypes.func.def(noop),
    popupAlign: PropTypes.object.def(() => ({})),
    popupVisible: PropTypes.bool,
    defaultPopupVisible: PropTypes.bool.def(false),
    maskTransitionName: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    maskAnimation: PropTypes.string,
    stretch: PropTypes.string,
    alignPoint: PropTypes.bool // Maybe we can support user pass position in the future
  },
  setup(props, {attrs, emit, slots}) {
    const componentInstance = getCurrentInstance();
    const {__emit} = BaseMixin(componentInstance);
    const vcTriggerContext: any = inject('vcTriggerContext') || {};
    const savePopupRef = inject<any>('savePopupRef') || noop;
    const point = ref(null);
    const eventHandlers: any = {};

    const popupVisible = ref(props.popupVisible);
    if (props.popupVisible !== undefined) {
      popupVisible.value = !!props.popupVisible;
    } else {
      popupVisible.value = !!props.defaultPopupVisible;
    }
    ALL_HANDLERS.forEach(h => {
      eventHandlers[`fire${h}`] = e => {
        fireEvents(h, e);
      };
    });
    const prevPopupVisible = ref(popupVisible);
    const sPopupVisible = ref(popupVisible);
    watch(() => props.popupVisible, (val) => {
      if (val !== undefined) {
        prevPopupVisible.value = sPopupVisible.value;
        sPopupVisible.value = val;
      }
    });
    const renderComponent = ref(null);
    onMounted(() => {
      nextTick(() => {
        renderComponent.value?.(null);
        updatedCal();
      });
    });
    onUpdated(() => {
      const triggerAfterPopupVisibleChange = () => {
        if (sPopupVisible.value !== prevPopupVisible.value) {
          props.afterPopupVisibleChange(sPopupVisible.value);
        }
      };
      nextTick(() => {
        renderComponent.value?.(null, triggerAfterPopupVisibleChange);
        updatedCal();
      });
    });
    const contextmenuOutsideHandler1 = ref(null);
    const contextmenuOutsideHandler2 = ref(null);
    const mouseDownTimeout = ref(null);
    const clickOutsideHandler = ref(null);
    const touchOutsideHandler = ref(null);
    const updatedCal = () => {
      // We must listen to `mousedown` or `touchstart`, edge case:
      // https://github.com/ant-design/ant-design/issues/5804
      // https://github.com/react-component/calendar/issues/250
      // https://github.com/react-component/trigger/issues/50
      if (sPopupVisible.value) {
        let currentDocument;
        if (!clickOutsideHandler.value && (isClickToHide() || isContextmenuToShow())) {
          currentDocument = props.getDocument();
          clickOutsideHandler.value = addEventListener(
            currentDocument,
            'mousedown',
            onDocumentClick
          );
        }
        // always hide on mobile
        if (!touchOutsideHandler.value) {
          currentDocument = currentDocument || props.getDocument();
          touchOutsideHandler.value = addEventListener(
            currentDocument,
            'touchstart',
            onDocumentClick
          );
        }
        // close popup when trigger type contains 'onContextmenu' and document is scrolling.
        if (!contextmenuOutsideHandler1.value && isContextmenuToShow()) {
          currentDocument = currentDocument || props.getDocument();
          contextmenuOutsideHandler1.value = addEventListener(
            currentDocument,
            'scroll',
            onContextmenuClose
          );
        }
        // close popup when trigger type contains 'onContextmenu' and window is blur.
        if (!contextmenuOutsideHandler2.value && isContextmenuToShow()) {
          contextmenuOutsideHandler2.value = addEventListener(
            window,
            'blur',
            onContextmenuClose
          );
        }
      } else {
        clearOutsideHandler();
      }
    };
    const childOriginEvents = ref({});
    const onMouseenter = (e) => {
      const {mouseEnterDelay} = props;
      fireEvents('mouseenter', e);
      delaySetPopupVisible(true, mouseEnterDelay, mouseEnterDelay ? null : e);
    };
    const fireEvents = (type, e) => {
      if (childOriginEvents.value[type]) {
        childOriginEvents.value[type](e);
      }
      __emit(type, e);
    };
    const onMouseMove = (e) => {
      fireEvents('mousemove', e);
      setPoint(e);
    };
    const onMouseleave = (e) => {
      fireEvents('mouseleave', e);
      delaySetPopupVisible(false, props.mouseLeaveDelay);
    };
    const focusTime = ref(0);
    const onFocus = (e) => {
      fireEvents('focus', e);
      // incase focusin and focusout
      clearDelayTimer();
      if (isFocusToShow()) {
        focusTime.value = Date.now();
        delaySetPopupVisible(true, props.focusDelay);
      }
    };
    const onPopupMouseenter = () => {
      clearDelayTimer();
    };
    const _component = ref(null);
    const onPopupMouseleave = (e) => {
      if (
        e &&
        e.relatedTarget &&
        !e.relatedTarget.setTimeout &&
        _component.value &&
        _component.value.getPopupDomNode &&
        contains(_component.value.getPopupDomNode(), e.relatedTarget)
      ) {
        return;
      }
      delaySetPopupVisible(false, props.mouseLeaveDelay);
    };
    const onMousedown = (e) => {
      fireEvents('mousedown', e);
      preClickTime.value = Date.now();
    };
    const onTouchstart = (e) => {
      fireEvents('touchstart', e);
      preTouchTime.value = Date.now();
    };
    const onBlur = (e) => {
      if (!contains(e.target, e.relatedTarget || document.activeElement)) {
        fireEvents('blur', e);
        clearDelayTimer();
        if (isBlurToHide()) {
          delaySetPopupVisible(false, props.blurDelay);
        }
      }
    };
    const onContextmenu = (e) => {
      e.preventDefault();
      fireEvents('contextmenu', e);
      setPopupVisible(true, e);
    };
    const onContextmenuClose = (event) => {
      if (isContextmenuToShow()) {
        close(event);
      }
    };
    const preClickTime = ref(0);
    const preTouchTime = ref(0);
    const onClick = (event) => {
      fireEvents('click', event);
      // focus will trigger click
      if (focusTime.value) {
        let preTime;
        if (preClickTime.value && preTouchTime.value) {
          preTime = Math.min(preClickTime.value, preTouchTime.value);
        } else if (preClickTime.value) {
          preTime = preClickTime.value;
        } else if (preTouchTime.value) {
          preTime = preTouchTime.value;
        }
        if (Math.abs(preTime - focusTime.value) < 20) {
          return;
        }
        focusTime.value = 0;
      }
      preClickTime.value = 0;
      preTouchTime.value = 0;
      // Only prevent default when all the action is click.
      // https://github.com/ant-design/ant-design/issues/17043
      // https://github.com/ant-design/ant-design/issues/17291
      if (
        isClickToShow() &&
        (isClickToHide() || isBlurToHide()) &&
        event &&
        event.preventDefault
      ) {
        event.preventDefault();
      }
      if (event && event.domEvent) {
        event.domEvent.preventDefault();
      }
      const nextVisible = !sPopupVisible.value;
      if ((isClickToHide() && !nextVisible) || (nextVisible && isClickToShow())) {
        setPopupVisible(!sPopupVisible.value, event);
      }
    };
    const hasPopupMouseDown = ref(false);
    const onPopupMouseDown = (...args) => {
      hasPopupMouseDown.value = true;

      clearTimeout(mouseDownTimeout.value);
      mouseDownTimeout.value = setTimeout(() => {
        hasPopupMouseDown.value = false;
      }, 0);

      if (vcTriggerContext.onPopupMouseDown) {
        vcTriggerContext.onPopupMouseDown(...args);
      }
    };
    const onDocumentClick = (event) => {
      if (props.mask && !props.maskClosable) {
        return;
      }
      const target = event.target;
      const root = componentInstance.vnode.el;
      if (!contains(root, target) && !hasPopupMouseDown.value) {
        close(event);
      }
    };
    const getRootDomNode = () => {
      return trigger.value.el;
    };
    const handleGetPopupClassFromAlign = (align) => {
      const className = [];
      const {
        popupPlacement,
        builtinPlacements,
        prefixCls,
        alignPoint,
        getPopupClassNameFromAlign
      } = props;
      if (popupPlacement && builtinPlacements) {
        className.push(getAlignPopupClassName(builtinPlacements, prefixCls, align, alignPoint));
      }
      if (getPopupClassNameFromAlign) {
        className.push(getPopupClassNameFromAlign(align));
      }
      return className.join(' ');
    };
    const getPopupAlign = () => {
      const {popupPlacement, popupAlign, builtinPlacements} = props;
      if (popupPlacement && builtinPlacements) {
        return getAlignFromPlacement(builtinPlacements, popupPlacement, popupAlign);
      }
      return popupAlign;
    };
    const savePopup = (node) => {
      _component.value = node;
      savePopupRef(node);
    };
    const getComponent = () => {
      const mouseProps: any = {};
      if (isMouseEnterToShow()) {
        mouseProps.onMouseenter = onPopupMouseenter;
      }
      if (isMouseLeaveToHide()) {
        mouseProps.onMouseleave = onPopupMouseleave;
      }
      mouseProps.onMousedown = onPopupMouseDown;
      mouseProps.onTouchstart = onPopupMouseDown;
      const {
        prefixCls,
        destroyPopupOnHide,
        popupClassName,
        action,
        popupAnimation,
        popupTransitionName,
        popupStyle,
        mask,
        maskAnimation,
        maskTransitionName,
        zIndex,
        stretch,
        alignPoint
      } = props;
      const align = getPopupAlign();
      const popupProps = {
        prefixCls,
        destroyPopupOnHide,
        visible: sPopupVisible,
        point: alignPoint && point,
        action,
        align,
        animation: popupAnimation,
        getClassNameFromAlign: handleGetPopupClassFromAlign,
        stretch,
        getRootDomNode,
        mask,
        zIndex,
        transitionName: popupTransitionName,
        maskAnimation,
        maskTransitionName,
        popupClassName,
        popupStyle,
        onAlign: getListeners(attrs).popupAlign || noop,
        ...mouseProps,
        ref: savePopup
      };
      const popupContent = getComponentFromProp(componentInstance, 'popup');
      return <Popup {...popupProps}>{popupContent}</Popup>;
    };

    const setPopupVisible = (visible: boolean, event?) => {
      const {alignPoint} = props;
      clearDelayTimer();
      if (prevPopupVisible.value !== visible) {
        if (props.popupVisible === undefined) {
          sPopupVisible.value = visible;
          prevPopupVisible.value = visible;
        }
        emit('popupVisibleChange', visible, event);
      }
      // Always record the point position since mouseEnterDelay will delay the show
      if (alignPoint && event) {
        setPoint(event);
      }
    };
    const setPoint = (point) => {
      const {alignPoint} = props;
      if (!alignPoint || !point) {
        return;
      }
      point.value = {
        pageX: point.pageX,
        pageY: point.pageY
      };
    };
    const delayTimer = ref(null);
    const delaySetPopupVisible = (visible, delayS, event?) => {
      const delay = delayS * 1000;
      clearDelayTimer();
      if (delay) {
        const point = event ? {pageX: event.pageX, pageY: event.pageY} : null;
        delayTimer.value = requestAnimationTimeout(() => {
          setPopupVisible(visible, point);
          clearDelayTimer();
        }, delay);
      } else {
        setPopupVisible(visible, event);
      }
    };

    const clearDelayTimer = () => {
      if (delayTimer.value) {
        cancelAnimationTimeout(delayTimer.value);
        delayTimer.value = null;
      }
    };

    const clearOutsideHandler = () => {
      if (clickOutsideHandler.value) {
        clickOutsideHandler.value.remove();
        clickOutsideHandler.value = null;
      }

      if (contextmenuOutsideHandler1.value) {
        contextmenuOutsideHandler1.value.remove();
        contextmenuOutsideHandler1.value = null;
      }

      if (contextmenuOutsideHandler2.value) {
        contextmenuOutsideHandler2.value.remove();
        contextmenuOutsideHandler2.value = null;
      }

      if (touchOutsideHandler.value) {
        touchOutsideHandler.value.remove();
        touchOutsideHandler.value = null;
      }
    };

    const createTwoChains = (event) => {
      let fn = () => {
      };
      const events = getListeners(attrs);
      if (childOriginEvents.value[event] && events[event]) {
        return this[`fire${event}`];
      }
      fn = childOriginEvents.value[event] || events[event] || fn;
      return fn;
    };

    const isClickToShow = () => {
      const {action, showAction} = props;
      return action.indexOf('click') !== -1 || showAction.indexOf('click') !== -1;
    };

    const isContextmenuToShow = () => {
      const {action, showAction} = props;
      return action.indexOf('contextmenu') !== -1 || showAction.indexOf('contextmenu') !== -1;
    };

    const isClickToHide = () => {
      const {action, hideAction} = props;
      return action.indexOf('click') !== -1 || hideAction.indexOf('click') !== -1;
    };

    const isMouseEnterToShow = () => {
      const {action, showAction} = props;
      return action.indexOf('hover') !== -1 || showAction.indexOf('mouseenter') !== -1;
    };

    const isMouseLeaveToHide = () => {
      const {action, hideAction} = props;
      return action.indexOf('hover') !== -1 || hideAction.indexOf('mouseleave') !== -1;
    };

    const isFocusToShow = () => {
      const {action, showAction} = props;
      return action.indexOf('focus') !== -1 || showAction.indexOf('focus') !== -1;
    };

    const isBlurToHide = () => {
      const {action, hideAction} = props;
      return action.indexOf('focus') !== -1 || hideAction.indexOf('blur') !== -1;
    };
    const forcePopupAlign = () => {
      if (sPopupVisible.value && _component.value && _component.value.$refs.alignInstance) {
        _component.value.$refs.alignInstance.forceAlign();
      }
    };
    const close = (event) => {
      setPopupVisible(false, event);
    };
    onBeforeUnmount(() => {
      clearDelayTimer();
      clearOutsideHandler();
      clearTimeout(mouseDownTimeout.value);
    });
    const trigger = ref(undefined);
    const setTrigger = (el) => {
      trigger.value = el;
    };
    const setRenderComponent = (renderComponent) => {
      renderComponent.value = renderComponent;
    };
    const getTrigger = () => {
      return trigger.value;
    };
    provide('vcTriggerContext', componentInstance);
    return {
      prevPopupVisible,
      sPopupVisible,
      point, forcePopupAlign,
      isClickToHide, isContextmenuToShow,
      isClickToShow, isMouseLeaveToHide,
      onClick, onMousedown, onTouchstart,
      createTwoChains, isMouseEnterToShow,
      onMouseenter, onMouseMove, onMouseleave, getComponent,
      isFocusToShow, isBlurToHide, onFocus, onBlur,
      onContextmenu,
      setRenderComponent,
      onPopupMouseDown,
      childOriginEvents,
      setTrigger, getTrigger
    };
  },
  render(ctx) {
    const children = filterEmpty(this.$slots.default);
    const {alignPoint} = this.$props;

    if (children.length > 1) {
      warning(false, 'Trigger $slots.default.length > 1, just support only one default', true);
    }
    const child = children[0];
    ctx.childOriginEvents.value = getListeners(child);
    const newChildProps: any = {
      key: 'trigger'
    };

    if (ctx.isContextmenuToShow()) {
      newChildProps.onContextmenu = this.onContextmenu;
    } else {
      newChildProps.onContextmenu = this.createTwoChains('contextmenu');
    }

    if (ctx.isClickToHide() || ctx.isClickToShow()) {
      newChildProps.onClick = ctx.onClick;
      newChildProps.onMousedown = ctx.onMousedown;
      newChildProps.onTouchstart = ctx.onTouchstart;
    } else {
      newChildProps.onClick = ctx.createTwoChains('click');
      newChildProps.onMousedown = ctx.createTwoChains('mousedown');
      newChildProps.onTouchstart = ctx.createTwoChains('onTouchstart');
    }
    if (ctx.isMouseEnterToShow()) {
      newChildProps.onMouseenter = ctx.onMouseenter;
      if (alignPoint) {
        newChildProps.onMousemove = ctx.onMouseMove;
      }
    } else {
      newChildProps.onMouseenter = ctx.createTwoChains('mouseenter');
    }
    if (ctx.isMouseLeaveToHide()) {
      newChildProps.onMouseleave = ctx.onMouseleave;
    } else {
      newChildProps.onMouseleave = ctx.createTwoChains('mouseleave');
    }

    if (ctx.isFocusToShow() || ctx.isBlurToHide()) {
      newChildProps.onFocus = ctx.onFocus;
      newChildProps.onBlur = ctx.onBlur;
    } else {
      newChildProps.onFocus = ctx.createTwoChains('focus');
      newChildProps.onBlur = e => {
        if (e && (!e.relatedTarget || !contains(e.target, e.relatedTarget))) {
          ctx.createTwoChains('blur')(e);
        }
      };
    }
    const style: any = {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%'
    };
    ctx.setTrigger(cloneVNode(child, newChildProps));
    return [
      ctx.getTrigger(),
      // @ts-ignore
      <Teleport to="body">
        <div style={style}>
          {ctx.getComponent()}
        </div>
      </Teleport>];
  }
}) as any;
