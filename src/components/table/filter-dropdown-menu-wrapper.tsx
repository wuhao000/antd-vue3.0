import {defineComponent} from 'vue';

export default defineComponent({
  name: 'FilterDropdownMenuWrapper',
  setup() {
    const handelClick = (e) => {
      e.stopPropagation();
      //this.$emit('click', e);
    };
    return {
      handelClick
    };
  },
  render() {
    const {$slots, handelClick} = this;
    return <div onClick={handelClick}>{$slots.default}</div>;
  }
});
