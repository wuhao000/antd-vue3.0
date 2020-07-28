import { ref, defineComponent, getCurrentInstance, nextTick, watch, onMounted, onBeforeUnmount } from 'vue';
<template>
  <div :style="style"
       :class="[{
      [classNameActive]: enabled,
      [classNameDragging]: dragging,
      [classNameResizing]: resizing,
      [classNameDraggable]: draggable,
      [classNameResizable]: resizable
    }, className]"
       @mousedown="elementMouseDown"
       @touchstart="elementTouchDown"
  >
    <div v-for="handle in actualHandles"
         :key="handle"
         :class="[classNameHandle, classNameHandle + '-' + handle]"
         :style="{display : enabled ? 'block' : 'none'}"
         @mousedown.stop.prevent="handleDown(handle, $event)"
         @touchstart.stop.prevent="handleTouchDown(handle, $event)"
    >
      <slot :name="handle"></slot>
    </div>
    <slot></slot>
  </div>
</template>
<script lang="tsx">
  import {computed, defineComponent, ref, watch, onMounted, onBeforeUnmount, getCurrentInstance} from 'vue';
  import {addEvent, getComputedSize, matchesSelectorToParentElements, removeEvent} from './utils/dom';
  import {computeHeight, computeWidth, restrictToBounds, snapToGrid} from './utils/fns';
  import './vue-draggable-resizable.css';

  const events = {
    mouse: {
      start: 'mousedown',
      move: 'mousemove',
      stop: 'mouseup'
    },
    touch: {
      start: 'touchstart',
      move: 'touchmove',
      stop: 'touchend'
    }
  };

  const userSelectNone = {
    userSelect: 'none',
    MozUserSelect: 'none',
    WebkitUserSelect: 'none',
    MsUserSelect: 'none'
  };

  const userSelectAuto = {
    userSelect: 'auto',
    MozUserSelect: 'auto',
    WebkitUserSelect: 'auto',
    MsUserSelect: 'auto'
  };

  let eventsFor = events.mouse;

  export default defineComponent({
    name: 'vue-draggable-resizable',
    props: {
      className: {
        type: String,
        default: 'vdr'
      },
      classNameDraggable: {
        type: String,
        default: 'draggable'
      },
      classNameResizable: {
        type: String,
        default: 'resizable'
      },
      classNameDragging: {
        type: String,
        default: 'dragging'
      },
      classNameResizing: {
        type: String,
        default: 'resizing'
      },
      classNameActive: {
        type: String,
        default: 'active'
      },
      classNameHandle: {
        type: String,
        default: 'handle'
      },
      disableUserSelect: {
        type: Boolean,
        default: true
      },
      enableNativeDrag: {
        type: Boolean,
        default: false
      },
      preventDeactivation: {
        type: Boolean,
        default: false
      },
      active: {
        type: Boolean,
        default: false
      },
      draggable: {
        type: Boolean,
        default: true
      },
      resizable: {
        type: Boolean,
        default: true
      },
      lockAspectRatio: {
        type: Boolean,
        default: false
      },
      w: {
        type: [Number, String],
        default: 200,
        validator: (val) => {
          if (typeof val === 'number') {
            return val > 0;
          }

          return val === 'auto';
        }
      },
      h: {
        type: [Number, String],
        default: 200,
        validator: (val) => {
          if (typeof val === 'number') {
            return val > 0;
          }

          return val === 'auto';
        }
      },
      minWidth: {
        type: Number,
        default: 0,
        validator: (val) => val >= 0
      },
      minHeight: {
        type: Number,
        default: 0,
        validator: (val) => val >= 0
      },
      maxWidth: {
        type: Number,
        default: null,
        validator: (val) => val >= 0
      },
      maxHeight: {
        type: Number,
        default: null,
        validator: (val) => val >= 0
      },
      x: {
        type: Number,
        default: 0
      },
      y: {
        type: Number,
        default: 0
      },
      z: {
        type: [String, Number],
        default: 'auto',
        validator: (val) => (typeof val === 'string' ? val === 'auto' : val >= 0)
      },
      handles: {
        type: Array,
        default: () => ['tl', 'tm', 'tr', 'mr', 'br', 'bm', 'bl', 'ml'],
        validator: (val: string[]) => {
          const s = new Set(['tl', 'tm', 'tr', 'mr', 'br', 'bm', 'bl', 'ml']);

          return new Set(val.filter(h => s.has(h))).size === val.length;
        }
      },
      dragHandle: {
        type: String,
        default: null
      },
      dragCancel: {
        type: String,
        default: null
      },
      axis: {
        type: String,
        default: 'both',
        validator: (val: string) => ['x', 'y', 'both'].includes(val)
      },
      grid: {
        type: Array,
        default: () => [1, 1]
      },
      parent: {
        type: Boolean,
        default: false
      },
      scale: {
        type: Number,
        default: 1,
        validator: (val) => val > 0
      },
      onDragStart: {
        type: Function,
        default: () => () => true
      },
      onDrag: {
        type: Function,
        default: () => () => true
      },
      onResizeStart: {
        type: Function,
        default: () => () => true
      },
      onResize: {
        type: Function,
        default: () => () => true
      }
    },
    setup($props: any, {emit}) {
      const left = ref($props.x);
      const top = ref($props.y);
      const right = ref(null);
      const bottom = ref(null);
      const width = ref(null);
      const height = ref(null);

      const widthTouched = ref(false);
      const heightTouched = ref(false);

      const aspectFactor = ref(null);

      const parentWidth = ref(null);
      const parentHeight = ref(null);

      const minW = ref($props.minWidth);
      const minH = ref($props.minHeight);

      const maxW = ref($props.maxWidth);
      const maxH = ref($props.maxHeight);

      const handle = ref(null);
      const enabled = ref($props.active);
      const resizing = ref(false);
      const dragging = ref(false);
      const zIndex = ref($props.z);

      const bounds = ref(undefined);
      const mouseClickPosition = ref(undefined);
      const actualHandles = computed(() => {
        if (!$props.resizable) {
          return [];
        }

        return $props.handles;
      });
      const resizingOnX = computed(() => {
        return (Boolean(handle.value) && (handle.value.includes('l') || handle.value.includes('r')));
      });
      const resizingOnY = computed(() => {
        return (Boolean(handle.value) && (handle.value.includes('t') || handle.value.includes('b')));
      });
      const computedHeight = computed(() => {
        if ($props.h === 'auto') {
          if (!heightTouched.value) {
            return 'auto';
          }
        }

        return height.value + 'px';
      });
      const computedWidth = computed(() => {
        if ($props.w === 'auto') {
          if (!widthTouched.value) {
            return 'auto';
          }
        }

        return width.value + 'px';
      });
      const style = computed(() => {
        return {
          transform: `translate(${left.value}px, ${top.value}px)`,
          width: computedWidth.value,
          height: computedHeight.value,
          zIndex: zIndex.value,
          ...(dragging.value && $props.disableUserSelect ? userSelectNone : userSelectAuto)
        };
      });

      watch(() => $props.active, (val) => {
        enabled.value = val;
        if (val) {
          emit('activated');
        } else {
          emit('deactivated');
        }
      });
      watch(() => $props.z, (val) => {
        if (val >= 0 || val === 'auto') {
          zIndex.value = val;
        }
      });
      watch(() => $props.x, (val) => {
        if (resizing.value || dragging.value) {
          return;
        }

        if ($props.parent) {
          bounds.value = calcDragLimits();
        }
        moveHorizontally(val);
      });
      watch(() => $props.y, (val) => {
        if (resizing.value || dragging.value) {
          return;
        }

        if ($props.parent) {
          bounds.value = calcDragLimits();
        }
        moveVertically(val);
      });
      watch(() => $props.lockAspectRatio, (val) => {
        if (val) {
          aspectFactor.value = width.value / height.value;
        } else {
          aspectFactor.value = undefined;
        }
      });
      watch(() => $props.minWidth, (val) => {
        if (val > 0 && val <= width.value) {
          minW.value = val;
        }
      });
      watch(() => $props.minHeight, (val) => {
        if (val > 0 && val <= height.value) {
          minH.value = val;
        }
      });
      watch(() => $props.maxWidth, (val) => {
        maxW.value = val;
      });
      watch(() => $props.maxHeight, (val) => {
        maxH.value = val;
      });
      watch(() => $props.w, (val) => {
        if (resizing.value || dragging.value) {
          return;
        }

        if ($props.parent) {
          bounds.value = calcResizeLimits();
        }

        changeWidth(val);
      });
      watch(() => $props.h, (val) => {
        if (resizing.value || dragging.value) {
          return;
        }

        if ($props.parent) {
          bounds.value = calcResizeLimits();
        }

        changeHeight(val);
      });
      const resetBoundsAndMouseState = () => {
        mouseClickPosition.value = {mouseX: 0, mouseY: 0, x: 0, y: 0, w: 0, h: 0};

        bounds.value = {
          minLeft: null,
          maxLeft: null,
          minRight: null,
          maxRight: null,
          minTop: null,
          maxTop: null,
          minBottom: null,
          maxBottom: null
        };
      };
      const checkParentSize = () => {
        if ($props.parent) {
          const [newParentWidth, newParentHeight] = getParentSize();

          parentWidth.value = newParentWidth;
          parentHeight.value = newParentHeight;
        }
      };
      const instance = getCurrentInstance();
      const getRootEl = () => {
        return instance.vnode.el;
      };
      const getParentSize = () => {
        if ($props.parent) {
          const style = window.getComputedStyle(getRootEl().parentNode, null);

          return [
            parseInt(style.getPropertyValue('width'), 10),
            parseInt(style.getPropertyValue('height'), 10)
          ];
        }

        return [null, null];
      };
      const elementTouchDown = (e) => {
        eventsFor = events.touch;

        elementDown(e);
      };
      const elementMouseDown = (e) => {
        eventsFor = events.mouse;

        elementDown(e);
      };
      const elementDown = (e) => {
        if (e instanceof MouseEvent && e.which !== 1) {
          return;
        }

        const target = e.target || e.srcElement;

        if (getRootEl().contains(target)) {
          if ($props.onDragStart(e) === false) {
            return;
          }

          if (
              ($props.dragHandle && !matchesSelectorToParentElements(target, $props.dragHandle, getRootEl())) ||
              ($props.dragCancel && matchesSelectorToParentElements(target, $props.dragCancel, getRootEl()))
          ) {
            dragging.value = false;

            return;
          }

          if (!enabled.value) {
            enabled.value = true;

            emit('activated');
            emit('update:active', true);
          }

          if ($props.draggable) {
            dragging.value = true;
          }

          mouseClickPosition.value.mouseX = e.touches ? e.touches[0].pageX : e.pageX;
          mouseClickPosition.value.mouseY = e.touches ? e.touches[0].pageY : e.pageY;

          mouseClickPosition.value.left = left.value;
          mouseClickPosition.value.right = right.value;
          mouseClickPosition.value.top = top.value;
          mouseClickPosition.value.bottom = bottom.value;

          if ($props.parent) {
            bounds.value = calcDragLimits();
          }

          addEvent(document.documentElement, eventsFor.move, move);
          addEvent(document.documentElement, eventsFor.stop, handleUp);
        }
      };
      const calcDragLimits = () => {
        return {
          minLeft: left.value % $props.grid[0],
          maxLeft: Math.floor((parentWidth.value - width.value - left.value) / $props.grid[0]) * $props.grid[0] + left.value,
          minRight: right.value % $props.grid[0],
          maxRight: Math.floor((parentWidth.value - width.value - right.value) / $props.grid[0]) * $props.grid[0] + right.value,
          minTop: top.value % $props.grid[1],
          maxTop: Math.floor((parentHeight.value - height.value - top.value) / $props.grid[1]) * $props.grid[1] + top.value,
          minBottom: bottom.value % $props.grid[1],
          maxBottom: Math.floor((parentHeight.value - height.value - bottom.value) / $props.grid[1]) * $props.grid[1] + bottom.value
        };
      };
      const deselect = (e) => {
        const target = e.target || e.srcElement;
        const regex = new RegExp($props.className + '-([trmbl]{2})', '');

        if (!getRootEl().contains(target) && !regex.test(target.className)) {
          if (enabled.value && !$props.preventDeactivation) {
            enabled.value = false;

            emit('deactivated');
            emit('update:active', false);
          }

          removeEvent(document.documentElement, eventsFor.move, handleResize);
        }

        resetBoundsAndMouseState();
      };
      const handleTouchDown = (handle, e) => {
        eventsFor = events.touch;

        handleDown(handle, e);
      };
      const handleDown = (handleV, e) => {
        if (e instanceof MouseEvent && e.which !== 1) {
          return;
        }

        if ($props.onResizeStart(handleV, e) === false) {
          return;
        }

        if (e.stopPropagation) {
          e.stopPropagation();
        }

        // Here we avoid a dangerous recursion by faking
        // corner handles as middle handles
        if ($props.lockAspectRatio && !handleV.includes('m')) {
          handle.value = 'm' + handleV.substring(1);
        } else {
          handle.value = handleV;
        }

        resizing.value = true;

        mouseClickPosition.value.mouseX = e.touches ? e.touches[0].pageX : e.pageX;
        mouseClickPosition.value.mouseY = e.touches ? e.touches[0].pageY : e.pageY;
        mouseClickPosition.value.left = left.value;
        mouseClickPosition.value.right = right.value;
        mouseClickPosition.value.top = top.value;
        mouseClickPosition.value.bottom = bottom.value;

        bounds.value = calcResizeLimits();

        addEvent(document.documentElement, eventsFor.move, handleResize);
        addEvent(document.documentElement, eventsFor.stop, handleUp);
      };
      const calcResizeLimits = () => {
        let minWV = minW.value;
        let minHV = minH.value;
        let maxWV = maxW.value;
        let maxHV = maxH.value;

        const aspectFactorV = aspectFactor.value;
        const [gridX, gridY] = $props.grid;
        const widthV = width.value;
        const heightV = height.value;
        const leftV = left.value;
        const topV = top.value;
        const rightV = right.value;
        const bottomV = bottom.value;

        if ($props.lockAspectRatio) {
          if (minWV / minHV > aspectFactorV) {
            minHV = minWV / aspectFactorV;
          } else {
            minWV = aspectFactorV * minHV;
          }

          if (maxWV && maxHV) {
            maxWV = Math.min(maxWV, aspectFactorV * maxHV);
            maxHV = Math.min(maxHV, maxWV / aspectFactorV);
          } else if (maxWV) {
            maxHV = maxWV / aspectFactorV;
          } else if (maxHV) {
            maxWV = aspectFactorV * maxHV;
          }
        }

        maxW.value = maxWV - (maxWV % gridX);
        maxH.value = maxHV - (maxHV % gridY);

        const limits = {
          minLeft: null,
          maxLeft: null,
          minTop: null,
          maxTop: null,
          minRight: null,
          maxRight: null,
          minBottom: null,
          maxBottom: null
        };

        if ($props.parent) {
          limits.minLeft = leftV % gridX;
          limits.maxLeft = leftV + Math.floor((widthV - minWV) / gridX) * gridX;
          limits.minTop = topV % gridY;
          limits.maxTop = topV + Math.floor((heightV - minHV) / gridY) * gridY;
          limits.minRight = rightV % gridX;
          limits.maxRight = rightV + Math.floor((widthV - minWV) / gridX) * gridX;
          limits.minBottom = bottomV % gridY;
          limits.maxBottom = bottomV + Math.floor((heightV - minHV) / gridY) * gridY;

          if (maxWV) {
            limits.minLeft = Math.max(limits.minLeft, parentWidth.value - rightV - maxWV);
            limits.minRight = Math.max(limits.minRight, parentWidth.value - leftV - maxWV);
          }

          if (maxHV) {
            limits.minTop = Math.max(limits.minTop, parentHeight.value - bottomV - maxHV);
            limits.minBottom = Math.max(limits.minBottom, parentHeight.value - topV - maxHV);
          }

          if ($props.lockAspectRatio) {
            limits.minLeft = Math.max(limits.minLeft, leftV - topV * aspectFactorV);
            limits.minTop = Math.max(limits.minTop, topV - leftV / aspectFactorV);
            limits.minRight = Math.max(limits.minRight, rightV - bottomV * aspectFactorV);
            limits.minBottom = Math.max(limits.minBottom, bottomV - rightV / aspectFactorV);
          }
        } else {
          limits.minLeft = null;
          limits.maxLeft = leftV + Math.floor((widthV - minWV) / gridX) * gridX;
          limits.minTop = null;
          limits.maxTop = topV + Math.floor((heightV - minHV) / gridY) * gridY;
          limits.minRight = null;
          limits.maxRight = rightV + Math.floor((widthV - minWV) / gridX) * gridX;
          limits.minBottom = null;
          limits.maxBottom = bottomV + Math.floor((heightV - minHV) / gridY) * gridY;

          if (maxWV) {
            limits.minLeft = -(rightV + maxWV);
            limits.minRight = -(leftV + maxWV);
          }

          if (maxHV) {
            limits.minTop = -(bottomV + maxHV);
            limits.minBottom = -(topV + maxHV);
          }

          if ($props.lockAspectRatio && (maxWV && maxHV)) {
            limits.minLeft = Math.min(limits.minLeft, -(rightV + maxWV));
            limits.minTop = Math.min(limits.minTop, -(maxHV + bottomV));
            limits.minRight = Math.min(limits.minRight, -leftV - maxWV);
            limits.minBottom = Math.min(limits.minBottom, -topV - maxHV);
          }
        }

        return limits;
      };
      const move = (e) => {
        if (resizing.value) {
          handleResize(e);
        } else if (dragging.value) {
          handleDrag(e);
        }
      };
      const handleDrag = (e) => {
        const axis = $props.axis;
        const grid = $props.grid;
        const localBounds = bounds.value;
        const mouseClickPositionV = mouseClickPosition.value;

        const tmpDeltaX = axis && axis !== 'y' ? mouseClickPositionV.mouseX - (e.touches ? e.touches[0].pageX : e.pageX) : 0;
        const tmpDeltaY = axis && axis !== 'x' ? mouseClickPositionV.mouseY - (e.touches ? e.touches[0].pageY : e.pageY) : 0;

        const [deltaX, deltaY] = snapToGrid(grid, tmpDeltaX, tmpDeltaY, $props.scale);

        const leftV = restrictToBounds(mouseClickPositionV.left - deltaX, localBounds.minLeft, localBounds.maxLeft);
        const topV = restrictToBounds(mouseClickPositionV.top - deltaY, localBounds.minTop, localBounds.maxTop);

        if ($props.onDrag(leftV, topV) === false) {
          return;
        }

        const rightV = restrictToBounds(mouseClickPositionV.right + deltaX, localBounds.minRight, localBounds.maxRight);
        const bottomV = restrictToBounds(mouseClickPositionV.bottom + deltaY, localBounds.minBottom, localBounds.maxBottom);

        left.value = leftV;
        top.value = topV;
        right.value = rightV;
        bottom.value = bottomV;

        emit('dragging', leftV, topV);
      };
      const moveHorizontally = (val) => {
        const [deltaX, _] = snapToGrid($props.grid, val, top.value, $props.scale);

        const leftV = restrictToBounds(deltaX, bounds.value.minLeft, bounds.value.maxLeft);

        left.value = leftV;
        right.value = parentWidth.value - width.value - leftV;
      };
      const moveVertically = (val) => {
        const [_, deltaY] = snapToGrid($props.grid, left.value, val, $props.scale);

        const topV = restrictToBounds(deltaY, bounds.value.minTop, bounds.value.maxTop);

        top.value = topV;
        bottom.value = parentHeight.value - height.value - topV;
      };
      const handleResize = (e) => {
        let leftV = left.value;
        let topV = top.value;
        let rightV = right.value;
        let bottomV = bottom.value;

        const mouseClickPositionV = mouseClickPosition.value;
        const lockAspectRatio = $props.lockAspectRatio;
        const aspectFactorV = aspectFactor.value;

        const tmpDeltaX = mouseClickPositionV.mouseX - (e.touches ? e.touches[0].pageX : e.pageX);
        const tmpDeltaY = mouseClickPositionV.mouseY - (e.touches ? e.touches[0].pageY : e.pageY);

        if (!widthTouched.value && tmpDeltaX) {
          widthTouched.value = true;
        }

        if (!heightTouched.value && tmpDeltaY) {
          heightTouched.value = true;
        }

        const [deltaX, deltaY] = snapToGrid($props.grid, tmpDeltaX, tmpDeltaY, $props.scale);

        if (handle.value.includes('b')) {
          bottomV = restrictToBounds(
              mouseClickPositionV.bottom + deltaY,
              bounds.value.minBottom,
              bounds.value.maxBottom
          );

          if ($props.lockAspectRatio && resizingOnY) {
            rightV = rightV - (bottomV - bottomV) * aspectFactorV;
          }
        } else if (handle.value.includes('t')) {
          topV = restrictToBounds(
              mouseClickPositionV.top - deltaY,
              bounds.value.minTop,
              bounds.value.maxTop
          );

          if ($props.lockAspectRatio && resizingOnY) {
            leftV = leftV - (topV - topV) * aspectFactorV;
          }
        }

        if (handle.value.includes('r')) {
          rightV = restrictToBounds(
              mouseClickPositionV.right + deltaX,
              bounds.value.minRight,
              bounds.value.maxRight
          );

          if ($props.lockAspectRatio && resizingOnX) {
            bottomV = bottomV - (rightV - rightV) / aspectFactorV;
          }
        } else if (handle.value.includes('l')) {
          leftV = restrictToBounds(
              mouseClickPositionV.left - deltaX,
              bounds.value.minLeft,
              bounds.value.maxLeft
          );

          if ($props.lockAspectRatio && resizingOnX) {
            topV = topV - (leftV - leftV) / aspectFactorV;
          }
        }

        const widthV = computeWidth(parentWidth.value, leftV, rightV);
        const heightV = computeHeight(parentHeight.value, topV, bottomV);

        if ($props.onResize(handle.value, leftV, topV, widthV, heightV) === false) {
          return;
        }

        left.value = leftV;
        top.value = topV;
        rightV.value = rightV;
        bottomV.value = bottomV;
        width.value = widthV;
        height.value = heightV;

        emit('resizing', leftV, topV, widthV, heightV);
      };
      const changeWidth = (val) => {
        const [newWidth, _] = snapToGrid($props.grid, val, 0, $props.scale);

        let rightV = restrictToBounds(
            (parentWidth.value - newWidth - left.value),
            bounds.value.minRight,
            bounds.value.maxRight
        );
        let bottomV = bottom.value;

        if ($props.lockAspectRatio) {
          bottomV = bottomV - (rightV - rightV) / aspectFactor.value;
        }

        const widthV = computeWidth(parentWidth.value, left.value, rightV);
        const heightV = computeHeight(parentHeight.value, top.value, bottomV);

        right.value = rightV;
        bottom.value = bottomV;
        width.value = widthV;
        height.value = heightV;
      };
      const changeHeight = (val) => {
        const [_, newHeight] = snapToGrid($props.grid, 0, val, $props.scale);

        let bottomV = restrictToBounds(
            (parentHeight.value - newHeight - top.value),
            bounds.value.minBottom,
            bounds.value.maxBottom
        );
        let rightV = right.value;

        if ($props.lockAspectRatio) {
          rightV = rightV - (bottomV - bottomV) * aspectFactor.value;
        }

        const widthV = computeWidth(parentWidth.value, left.value, rightV);
        const heightV = computeHeight(parentHeight.value, top.value, bottomV);

        right.value = rightV;
        bottom.value = bottomV;
        width.value = widthV;
        height.value = heightV;
      };
      const handleUp = (e) => {
        handle.value = null;

        resetBoundsAndMouseState();

        if (resizing.value) {
          resizing.value = false;
          emit('resizestop', left.value, top.value, width.value, height.value);
        }
        if (dragging.value) {
          dragging.value = false;
          emit('dragstop', left.value, top.value);
        }

        removeEvent(document.documentElement, eventsFor.move, handleResize);
      };
      onMounted(() => {
        if (!$props.enableNativeDrag) {
          getRootEl().ondragstart = () => false;
        }

        const [parentWidthV, parentHeightV] = getParentSize();

        parentWidth.value = parentWidthV;
        parentHeight.value = parentHeightV;

        const [widthV, heightV] = getComputedSize(getRootEl());

        aspectFactor.value = ($props.w === 'auto' ? widthV : $props.w) / ($props.h !== 'auto' ? $props.h : heightV);

        width.value = $props.w === 'auto' ? widthV : $props.w;
        height.value = $props.h === 'auto' ? heightV : $props.h;

        right.value = parentWidthV - widthV - left.value;
        bottom.value = parentHeightV - heightV - top.value;

        addEvent(document.documentElement, 'mousedown', deselect);
        addEvent(document.documentElement, 'touchend touchcancel', deselect);

        addEvent(window, 'resize', checkParentSize);
      });
      onBeforeUnmount(() => {
        removeEvent(document.documentElement, 'mousedown', deselect);
        removeEvent(document.documentElement, 'touchstart', handleUp);
        removeEvent(document.documentElement, 'mousemove', move);
        removeEvent(document.documentElement, 'touchmove', move);
        removeEvent(document.documentElement, 'mouseup', handleUp);
        removeEvent(document.documentElement, 'touchend touchcancel', deselect);

        removeEvent(window, 'resize', checkParentSize);
      });
      // eslint-disable-next-line


      if ($props.maxWidth && $props.minWidth > $props.maxWidth) {
        console.warn('[Vdr warn]: Invalid prop: minWidth cannot be greater than maxWidth');
      }


// eslint-disable-next-line


      if ($props.maxWidth && $props.minHeight > $props.maxHeight) {
        console.warn('[Vdr warn]: Invalid prop: minHeight cannot be greater than maxHeight');
      }


      resetBoundsAndMouseState();
      return {
        resetBoundsAndMouseState,
        checkParentSize,
        getParentSize,
        elementTouchDown,
        elementMouseDown,
        elementDown,
        calcDragLimits,
        deselect,
        handleTouchDown,
        handleDown,
        calcResizeLimits,
        move,
        handleDrag,
        moveHorizontally,
        moveVertically,
        handleResize,
        changeWidth,
        changeHeight,
        handleUp,
        style,
        actualHandles
      };
    }
  }) as any;
</script>
