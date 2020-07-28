import {getClassFromInstance, getListenersFromInstance} from '@/components/_util/props-util';
import {defineComponent, getCurrentInstance} from 'vue';
import PropTypes from '../../_util/vue-types';
import Touchable from '../../vc-m-feedback';

const InputHandler = defineComponent({
  name: 'InputHandler',
  props: {
    prefixCls: PropTypes.string,
    disabled: PropTypes.bool
  },
  render() {
    const instance = getCurrentInstance();
    const {prefixCls, disabled} = this.$props;
    const touchableProps = {
      disabled,
      activeClassName: `${prefixCls}-handler-active`,
      ...getListenersFromInstance(instance)
    };
    const content = this.$slots.default();
    const classes = getClassFromInstance(instance);
    return (
        <Touchable {...touchableProps}>
          <span class={classes}>{content}</span>
        </Touchable>
    );
  }
}) as any;

export default InputHandler;
