import PropTypes from '../_util/vue-types';
import LazyRenderBox from './lazy-render-box';
import {getListeners} from '../_util/props-util';
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    hiddenClassName: PropTypes.string.def(''),
    prefixCls: PropTypes.string,
    visible: PropTypes.bool
  },
  render() {
    const {prefixCls, visible, hiddenClassName} = this.$props;
    const divProps = {
      ...getListeners(this.$attrs)
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
