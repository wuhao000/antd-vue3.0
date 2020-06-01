import {defineComponent} from 'vue';

export default defineComponent({
  name: 'PopupSubMenu',
  render() {
    return this.$slots.default && this.$slots.default();
  }
});
