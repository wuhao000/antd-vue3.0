import {defineComponent} from 'vue';
import {Options, Vue} from 'vue-class-component';
import {Prop} from 'vue-property-decorator';

@Options({
  name: 'TestComponent',
  setup() {}
})
class TestComponent extends Vue {

  @Prop()
  public name: string;

}

const Component2 = defineComponent({
  props: {
    name: String
  }
});

const comp = <TestComponent name={'abc'}/>;
console.log(comp.type);
