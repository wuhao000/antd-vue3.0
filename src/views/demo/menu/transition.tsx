import {defineComponent, ref, Transition} from 'vue';

export default defineComponent({
  name: 'transitionDemo',
  setup() {
    return {
      show: ref(false)
    };
  },
  render(ctx) {
    return (
      <div>
        <button onClick={() => {
          ctx.show = !ctx.show;
        }}>aaa
        </button>
        {ctx.show.toString()}
        <Transition duration={1000} name="a">
          {ctx.show ? <div>111</div> : null}
        </Transition>
      </div>
    );
  }
});
