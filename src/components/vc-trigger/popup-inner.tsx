import PropTypes from '../_util/vue-types';
import LazyRenderBox from './lazy-render-box';
import {getListenersFromInstance, getListenersFromProps} from '../_util/props-util';
import { defineComponent, getCurrentInstance } from 'vue';

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
