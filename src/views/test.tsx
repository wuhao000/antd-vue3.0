import {useLocalValue} from '@/tools/value';
import {ref, Transition, defineComponent} from 'vue';
import Button from '@/components/button';

export default defineComponent({
  props: {
    value: String,
    defaultValue: {type: String, default: ''}
  },
  setup(props) {
    const {setValue, getValue} = useLocalValue(props.defaultValue);
    return {getValue, setValue, show: ref(false)};
  },
  render(ctx) {
    return [
      <Button onClick={() => {
        ctx.show = !ctx.show;
      }}></Button>,
        <Transition name="slide-up">
          <div v-show={ctx.show}>
            <ul>
              <li>1</li>
              <li>1</li>
              <li>1</li>
              <li>1</li>
              <li>1</li>
              <li>1</li>
              <li>1</li>
            </ul>
          </div>
        </Transition>
    ];
  }
});
