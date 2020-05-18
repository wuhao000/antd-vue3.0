import {defineComponent, getCurrentInstance} from 'vue';
import {getListeners} from '../../../_util/props-util';
import DateTBody from './date-tbody';
import DateTHead from './date-thead';

export default defineComponent({
  functional: true,
  render() {
    const currentInstance = getCurrentInstance();
    const props: any = {...this.$props, ...this.$attrs};
    const listeners = getListeners(currentInstance);
    const prefixCls = props.prefixCls;
    const bodyProps = {
      ...props,
      ...listeners
    };
    return (
        <table class={`${prefixCls}-table`} cellspacing="0" role="grid">
          <DateTHead {...bodyProps} />
          <DateTBody {...bodyProps} />
        </table>
    );
  }
});
