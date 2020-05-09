import {defineComponent, provide} from 'vue';
import {storeShape} from './PropTypes';

export default defineComponent({
  name: 'StoreProvider',
  props: {
    store: storeShape.isRequired
  },
  setup(props) {
    provide('storeContext', props);
  },
  render() {
    return this.$slots.default()[0];
  }
});
