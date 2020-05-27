import {defineComponent} from 'vue';
import KeyCode from '../../_util/keycode';
import PropTypes from '../../_util/vue-types';

export default defineComponent({
  name: 'Sentinel',
  props: {
    setRef: PropTypes.func,
    prevElement: PropTypes.any,
    nextElement: PropTypes.any
  },
  setup(props) {
    const onKeyDown = ({target, which, shiftKey}) => {
      const {nextElement, prevElement} = props;
      if (which !== KeyCode.TAB || document.activeElement !== target) {
        return;
      }

      // Tab next
      if (!shiftKey && nextElement) {
        nextElement.focus();
      }

      // Tab prev
      if (shiftKey && prevElement) {
        prevElement.focus();
      }
    };


    return {
      onKeyDown
    };
  },
  render(ctx) {
    const {setRef} = ctx.$props;
    return (
        <div
            tabindex={0}
            {...{
              directives: [
                {
                  name: 'ant-ref',
                  value: setRef
                }
              ]
            }}
            style={{
              width: '0',
              height: '0',
              overflow: 'hidden',
              position: 'absolute'
            }}
            onKeydown={ctx.onKeyDown}
            role="presentation"
        >
          {ctx.$slots.default && ctx.$slots.default()}
        </div>
    );
  }
}) as any;
