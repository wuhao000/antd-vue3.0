import PropTypes from './vue-types';
import {onMounted, onUpdated, onBeforeUnmount, defineComponent, ref} from 'vue';

export default defineComponent({
  props: {
    autoMount: PropTypes.bool.def(true),
    autoDestroy: PropTypes.bool.def(true),
    visible: PropTypes.bool,
    forceRender: PropTypes.bool.def(false),
    parent: PropTypes.any,
    getComponent: PropTypes.func.isRequired,
    getContainer: PropTypes.func.isRequired,
    children: PropTypes.func.isRequired
  },
  setup(props) {
    const container = ref(null)
    const _component = ref(null)
    const removeContainer = () => {
      if (container.value) {
        _component.value && _component.value.$destroy();
        container.value.parentNode.removeChild(container.value);
        container.value = null;
        _component.value = null;
      }
    };
    const componentEl = ref(null);
    const renderComponent = (componentProps = {}, ready?) => {
      const { visible, forceRender, getContainer, parent } = props;
      const self = this;
      if (visible || parent.$refs._component || forceRender) {
        let el = componentEl.value;
        if (!container.value) {
          container.value = getContainer();
          el = document.createElement('div');
          componentEl.value = el;
          container.value.appendChild(el);
        }
        if (!_component.value) {
          _component.value = new this.$root.constructor({
            el,
            parent: self,
            data: {
              comProps: componentProps,
            },
            mounted() {
              this.$nextTick(() => {
                if (ready) {
                  ready.call(self);
                }
              });
            },
            updated() {
              this.$nextTick(() => {
                if (ready) {
                  ready.call(self);
                }
              });
            },
            methods: {
              forceRender(p) {
                this.comProps = p;
                this.$forceUpdate();
              },
            },
            render() {
              return self.getComponent(this.comProps);
            },
          });
        } else {
          this._component.forceRender(componentProps);
        }
      }
    }
    onMounted(() => {
      if (props.autoMount) {
        renderComponent();
      }
    });
    onUpdated(() => {
      if (props.autoMount) {
        renderComponent();
      }
    });
    onBeforeUnmount(() => {
      if (props.autoDestroy) {
        removeContainer();
      }
    });
    return {renderComponent, removeContainer}
  },
  render(ctx) {
    return this.$props.children({
      renderComponent: ctx.renderComponent,
      removeContainer: ctx.removeContainer
    });
  }
}) as any;
