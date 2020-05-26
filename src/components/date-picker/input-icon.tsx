import {defineComponent, getCurrentInstance, VNode} from 'vue';
import {isValidElement} from '../_util/props-util';
import {cloneElement} from '../_util/vnode';
import Icon from '../icon';

export default defineComponent({
  functional: true,
  props: {
    prefixCls: String,
    suffixIcon: {}
  },
  components: {AIcon: Icon},
  render() {
    const {props} = getCurrentInstance()!;
    const {suffixIcon, prefixCls} = props;
    return (
        (suffixIcon && isValidElement(suffixIcon) ? (
            cloneElement(suffixIcon as VNode, {
              class: `${prefixCls}-picker-icon`
            })
        ) : (
            <span class={`${prefixCls}-picker-icon`}>{suffixIcon}</span>
        )) || <Icon type="calendar" class={`${prefixCls}-picker-icon`}/>
    );  }
});
