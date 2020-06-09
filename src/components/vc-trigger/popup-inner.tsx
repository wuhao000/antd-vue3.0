import {defineComponent, getCurrentInstance} from 'vue';
import {getListenersFromInstance} from '../_util/props-util';
import PropTypes from '../_util/vue-types';

export default defineComponent({
  props: {
    hiddenClassName: PropTypes.string.def(''),
    prefixCls: PropTypes.string,
    visible: PropTypes.bool
  },
  render() {
    const currentInstance = getCurrentInstance();
    const {prefixCls, visible, hiddenClassName} = this.$props;
    const divProps = {
      ...getListenersFromInstance(currentInstance)
    };
    return (
        <div {...divProps} class={!visible ? hiddenClassName : ''}>
          <div class={`${prefixCls}-content`}>
            {this.$slots.default()}
          </div>
        </div>
    );
  }
}) as any;
