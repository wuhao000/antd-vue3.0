import {useRefs} from '@/components/vc-tabs/src/save-ref';
import contains from '../../vc-util/Dom/contains';
import {useLocalValue} from '@/tools/value';
import {defineComponent, getCurrentInstance, ref} from 'vue';
import {getListenersFromVNode} from '../../_util/props-util';
import {cloneElement} from '../../_util/vnode';
import PropTypes from '../../_util/vue-types';
import Trigger from '../../vc-trigger';
import placements from './placements';

export default defineComponent({
  props: {
    minOverlayWidthMatchTrigger: PropTypes.bool,
    prefixCls: PropTypes.string.def('rc-dropdown'),
    transitionName: PropTypes.string,
    overlayClassName: PropTypes.string.def(''),
    openClassName: PropTypes.string,
    animation: PropTypes.any,
    align: PropTypes.object,
    overlayStyle: PropTypes.object.def(() => ({})),
    placement: PropTypes.string.def('bottomLeft'),
    overlay: PropTypes.any,
    trigger: PropTypes.array.def(['hover']),
    alignPoint: PropTypes.bool,
    showAction: PropTypes.array.def([]),
    hideAction: PropTypes.array.def([]),
    getPopupContainer: PropTypes.func,
    visible: PropTypes.bool,
    defaultVisible: PropTypes.bool.def(false),
    mouseEnterDelay: PropTypes.number.def(0.15),
    mouseLeaveDelay: PropTypes.number.def(0.1)
  },
  setup($props, {emit, slots}) {
    const {value: sVisible, setValue: setVisible} = useLocalValue($props.defaultVisible, 'visible');
    const {getRef, saveRef} = useRefs();
    const instance = getCurrentInstance();
    const childOriginEvents = ref(null);
    const overlayRef = ref(undefined);
    const onClick = (e) => {
      // do no call onVisibleChange, if you need click to hide, use onClick and control visible
      if (contains(e.target, overlayRef.value.el)) {
        return;
      }
      setVisible(false);
      emit('overlayClick', e);
      if (childOriginEvents.value.click) {
        childOriginEvents.value.click(e);
      }
    };
    const onVisibleChange = (visible) => {
      setVisible(visible);
      emit('visibleChange', visible);
    };
    const getMinOverlayWidthMatchTrigger = () => {
      const {minOverlayWidthMatchTrigger, alignPoint} = $props;
      if ('minOverlayWidthMatchTrigger' in $props) {
        return minOverlayWidthMatchTrigger;
      }

      return !alignPoint;
    };
    const getOverlayElement = () => {
      const overlay = $props.overlay || slots.overlay();
      let overlayElement;
      if (typeof overlay === 'function') {
        overlayElement = overlay();
      } else {
        overlayElement = overlay;
      }
      return overlayElement;
    };
    const getMenuElement = () => {
      const {prefixCls} = $props;
      childOriginEvents.value = getListenersFromVNode(slots.overlay()[0]);
      const overlayElement = getOverlayElement();
      const extraOverlayProps = {
        prefixCls: `${prefixCls}-menu`,
        getPopupContainer: () => getPopupDomNode(),
        onClick
      };
      if (typeof overlayElement.type === 'string') {
        delete extraOverlayProps.prefixCls;
      }
      return cloneElement(slots.overlay()[0], extraOverlayProps);
    };
    const getMenuElementOrLambda = () => {
      const overlay = $props.overlay || slots.overlay();
      if (typeof overlay === 'function') {
        return getMenuElement;
      }
      return getMenuElement();
    };
    const getPopupDomNode = () => {
      return getRef('trigger').getPopupDomNode();
    };
    const getOpenClassName = () => {
      const {openClassName, prefixCls} = $props;
      if (openClassName !== undefined) {
        return openClassName;
      }
      return `${prefixCls}-open`;
    };
    const afterVisibleChange = (visible) => {
      if (visible && getMinOverlayWidthMatchTrigger()) {
        const overlayNode = getPopupDomNode();
        const rootNode = instance.vnode.el;
        if (rootNode && overlayNode && rootNode.offsetWidth > overlayNode.offsetWidth) {
          overlayNode.style.minWidth = `${rootNode.offsetWidth}px`;
          if (
              getRef('trigger') &&
              getRef('trigger')._component &&
              getRef('trigger')._component.alignInstance
          ) {
            getRef('trigger')._component.alignInstance.forceAlign();
          }
        }
      }
    };
    const renderChildren = () => {
      const children = slots.default && slots.default()[0];
      return sVisible.value && children
          ? cloneElement(children, {class: getOpenClassName()})
          : children;
    };
    return {
      onClick,
      onVisibleChange,
      getMinOverlayWidthMatchTrigger,
      getOverlayElement,
      getMenuElement,
      getMenuElementOrLambda,
      getPopupDomNode,
      getOpenClassName,
      afterVisibleChange,
      renderChildren,
      sVisible,
      getRef,
      saveRef,
      setOverlay(el) {
        overlayRef.value = el
      }
    };
  },
  render() {
    const {
      prefixCls,
      transitionName,
      animation,
      align,
      placement,
      getPopupContainer,
      showAction,
      hideAction,
      overlayClassName,
      overlayStyle,
      trigger,
      ...otherProps
    } = this.$props;
    let triggerHideAction = hideAction;
    if (!triggerHideAction && trigger.indexOf('contextmenu') !== -1) {
      triggerHideAction = ['click'];
    }

    const triggerProps = {
      ...otherProps,
      prefixCls,
      popupClassName: overlayClassName,
      popupStyle: overlayStyle,
      builtinPlacements: placements,
      action: trigger,
      showAction,
      hideAction: triggerHideAction || [],
      popupPlacement: placement,
      popupAlign: align,
      popupTransitionName: transitionName,
      popupAnimation: animation,
      popupVisible: this.sVisible,
      afterPopupVisibleChange: this.afterVisibleChange,
      getPopupContainer,
      onPopupVisibleChange: this.onVisibleChange,
      ref: this.saveRef('trigger')
    };
    const popupContent = this.$slots.overlay && this.getMenuElement();
    this.setOverlay(popupContent);
    return (
        <Trigger {...triggerProps}>
          {this.renderChildren()}
          <template slot="popup">{popupContent}</template>
        </Trigger>
    );
  }
}) as any;
