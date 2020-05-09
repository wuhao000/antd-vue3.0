import {defineComponent} from 'vue';

export default defineComponent({
  name: 'VNode',
  props: {
    node: Object
  },
  setup(props) {
    return () => props.node;
  }
});
