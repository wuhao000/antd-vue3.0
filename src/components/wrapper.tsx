import {defineComponent, getCurrentInstance, h, reactive, ref} from 'vue';

const wrapper = defineComponent({
  setup(props, ctx) {
    const instance = getCurrentInstance();
    console.log(instance);
    const v = ref(0);
    const state = reactive({
      count: 0
    });
    const onClick = (count: number, e: Event) => {
      count++;
    };
    return () => <div onClick={(e) => {
      ctx.emit('click', e);
    }} class="abcd">
      <div>111</div>
      <a>{ctx.slots}</a>
    </div>;
  }
});
export default wrapper;
