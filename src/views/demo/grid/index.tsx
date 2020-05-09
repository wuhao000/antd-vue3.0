import {Col as ACol, Row as ARow} from '@/components/grid';
import {defineComponent} from 'vue';

export default defineComponent({
  setup() {
    return () => {
      return <ARow>
        <ACol span={6}>1</ACol>
        <ACol span={6}>2</ACol>
        <ACol span={6}>3</ACol>
        <ACol span={6}>4</ACol>
      </ARow>;
    };
  }
});
