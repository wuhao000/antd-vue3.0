// based on rc-resize-observer 0.1.3
import ResizeObserver from 'resize-observer-polyfill';
import {defineComponent, getCurrentInstance, onBeforeUnmount, onMounted, onUpdated, ref, VNode} from 'vue';

// Still need to be compatible with React 15, we use class component here
const VueResizeObserver: any = defineComponent({
  name: 'ResizeObserver',
  props: {
    disabled: Boolean
  },
  setup(props, {emit}) {
    const componentInstance = getCurrentInstance();
    const currentElement = ref(null);
    const resizeObserver = ref(null);
    const sWidth = ref(0);
    const sHeight = ref(0);
    const root = ref(undefined);
    const setRootNode = (children: VNode[]) => {
      if (Array.isArray(children)) {
        root.value = children[0];
      }
    };
    const onComponentUpdated = () => {
      const {disabled} = props;

      // Unregister if disabled
      if (disabled) {
        destroyObserver();
        return;
      }

      // Unregister if element changed
      const element = root.value.el;
      const elementChanged = element !== currentElement.value;
      if (elementChanged) {
        destroyObserver();
        currentElement.value = element;
      }

      if (!resizeObserver.value && element) {
        resizeObserver.value = new ResizeObserver(onResize);
        resizeObserver.value.observe(element);
      }
    };
    const onResize = (entries) => {
      const {target} = entries[0];
      const {width, height} = target.getBoundingClientRect();
      /**
       * Resize observer trigger when content size changed.
       * In most case we just care about element size,
       * let's use `boundary` instead of `contentRect` here to avoid shaking.
       */
      const fixedWidth = Math.floor(width);
      const fixedHeight = Math.floor(height);

      if (sWidth.value !== fixedWidth || sHeight.value !== fixedHeight) {
        const size = {width: fixedWidth, height: fixedHeight};
        sWidth.value = fixedWidth;
        sHeight.value = fixedHeight;
        emit('resize', size);
      }
    };

    const destroyObserver = () => {
      if (resizeObserver.value) {
        resizeObserver.value.disconnect();
        resizeObserver.value = null;
      }
    };
    onMounted(() => {
      onComponentUpdated();
    });
    onUpdated(() => {
      onComponentUpdated();
    });
    onBeforeUnmount(() => {
      destroyObserver();
    });
    return {
      setRootNode
    };
  },
  render() {
    const children = this.$slots.default && this.$slots.default();
    this.setRootNode(children);
    return children;
  }
});

export default VueResizeObserver;
