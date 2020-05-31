import {ref, defineComponent, getCurrentInstance, nextTick, onMounted, onUpdated, onBeforeUnmount} from 'vue';

const d = () => {
};

const a = defineComponent({
  name: 'Ab',
  props: {
    visible: {}
  },
  data() {
    return {};
  },
  setup($props, {emit}) {
    console.log();
    watch(() => $props.visible, (val) => {
      this.sVisible = val;
    });
    const a = () => {
      const c = $props.visible;
      b();
      emit('a', 'a');
      const props = $props;
    };
    const b = () => {

    };
    const c = function() {

    };
    onMounted(() => {
      console.log('mounted');
    });
    onUpdated(() => {
    });
    onBeforeUnmount(() => {
    })
    console.log('created');
    return {
      a,
      b,
      c,
      d
    };
  },
  render() {

  },
});
