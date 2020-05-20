import {defineComponent, getCurrentInstance} from 'vue';
import {getListenersFromInstance, getListenersFromProps} from '../../../_util/props-util';
import DateTBody from './date-tbody';
import DateTHead from './date-thead';

export default defineComponent({
  functional: true,
  name: 'DateTable',
  render() {
    const currentInstance = getCurrentInstance();
    const props: any = {...this.$props, ...this.$attrs};
    const listeners = getListenersFromInstance(currentInstance);
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
