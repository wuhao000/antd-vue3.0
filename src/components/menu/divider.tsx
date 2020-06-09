import { defineComponent } from 'vue';

export default defineComponent({
  name: 'AMenuDivider',
  props: {
    disabled: {
      type: Boolean,
      default: true,
    },
    rootPrefixCls: String,
  },
  render() {
    const { rootPrefixCls } = this.$props;
    return <li class={`${rootPrefixCls}-item-divider`} />;
  },
});
