import {useAlign} from '@/components/vc-align/index';
import {alignPoint} from 'dom-align';
import {alignElement} from '../../utils/align';
import clonedeep from 'lodash/cloneDeep';
import {defineComponent, getCurrentInstance, nextTick, onBeforeUnmount, onMounted, onUpdated, ref} from 'vue';
import {getListenersFromProps, getListenersFromInstance} from '../_util/props-util';
import PropTypes from '../_util/vue-types';
import addEventListener from '../vc-util/Dom/addEventListener';
import {buffer, isSamePoint, isSimilarValue, isWindow, restoreFocus} from './util';

function getElement(func) {
  if (typeof func !== 'function' || !func) {
    return null;
  }
  return func();
}

function getPoint(point) {
  if (typeof point !== 'object' || !point) {
    return null;
  }
  return point;
}

export default defineComponent({
  props: {
    childrenProps: PropTypes.object,
    align: PropTypes.object.isRequired,
    target: PropTypes.oneOfType([PropTypes.func, PropTypes.object]).def(() => window),
    monitorBufferTime: PropTypes.number.def(50),
    monitorWindowResize: PropTypes.bool.def(false),
    disabled: PropTypes.bool.def(false)
  },
  setup(props, {attrs}) {
    const instance = getCurrentInstance();
    const sourceRect = ref(null);
    const aligned = ref(false);
    const bufferMonitor = ref(null);
    const resizeHandler = ref(null);
    const prevProps = ref(null);
    const startMonitorWindowResize = () => {
      if (!resizeHandler.value) {
        bufferMonitor.value = buffer(forceAlign, props.monitorBufferTime);
        resizeHandler.value = addEventListener(window, 'resize', bufferMonitor.value);
      }
    };
    const stopMonitorWindowResize = () => {
      if (resizeHandler.value) {
        bufferMonitor.value.clear();
        resizeHandler.value.remove();
        resizeHandler.value = null;
      }
    };
    const forceAlign = () => {
      const {disabled, target, align} = props;
      if (!disabled && target) {
        const source = instance.vnode.el as any;
        const listeners = getListenersFromInstance(instance);
        let result;
        const element = getElement(target);
        const point = getPoint(target);

        // IE lose focus after element realign
        // We should record activeElement and restore later
        const activeElement = document.activeElement;
        if (element) {
          result = alignElement(source, element, align);
        } else if (point) {
          result = alignPoint(source, point, align);
        }
        restoreFocus(activeElement, source);
        aligned.value = true;
        listeners.align && listeners.align(source, result);
      }
    };
    onMounted(() => {
      nextTick(() => {
        prevProps.value = {...props};
        // if parent ref not attached .... use document.getElementById
        !aligned.value && forceAlign();
        if (!props.disabled && props.monitorWindowResize) {
          startMonitorWindowResize();
        }
      });
    });
    onUpdated(() => {
      nextTick(() => {
        let reAlign = false;
        if (!props.disabled) {
          const source = instance.vnode.el;
          if (source?.nodeName !== '#comment') {
            const currentSourceRect = source ? source.getBoundingClientRect() : null;
            if (prevProps.value.disabled) {
              reAlign = true;
            } else {
              const lastElement = prevProps.value.target;
              const currentElement = props.target;
              const lastPoint = getPoint(prevProps.value.target);
              const currentPoint = getPoint(props.target);
              if (isWindow(lastElement) && isWindow(currentElement)) {
                // Skip if is window
                reAlign = false;
              } else if (
                  lastElement !== currentElement || // Element change
                  (lastElement && !currentElement && currentPoint) || // Change from element to point
                  (lastPoint && currentPoint && currentElement) || // Change from point to element
                  (currentPoint && !isSamePoint(lastPoint, currentPoint))
              ) {
                reAlign = true;
              }

              // If source element size changed
              const preRect = sourceRect.value || {};
              if (
                  !reAlign &&
                  source &&
                  (!isSimilarValue(preRect.width, currentSourceRect.width) ||
                      !isSimilarValue(preRect.height, currentSourceRect.height))
              ) {
                reAlign = true;
              }
            }
            sourceRect.value = currentSourceRect;
          }
        }


        if (reAlign) {
          forceAlign();
        }

        if (props.monitorWindowResize && !props.disabled) {
          startMonitorWindowResize();
        } else {
          stopMonitorWindowResize();
        }
        prevProps.value = {...props, align: clonedeep(props.align)};
      });
    });
    onBeforeUnmount(() => {
      stopMonitorWindowResize();
    });
    return {aligned};
  },
  render() {
    return this.$slots.default && this.$slots.default()[0];
  }
}) as any;
