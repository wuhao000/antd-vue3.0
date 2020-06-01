import {defineComponent} from 'vue';

export default defineComponent({
  name: 'PopupSubMenu',
  props: {
    prefixCls: {type: String}
  },
  render() {
    return this.$slots.default && this.$slots.default({
      rootPrefixCls: this.prefixCls
    });
  }
});
