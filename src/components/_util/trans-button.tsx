import {getListenersFromInstance} from '@/components/_util/props-util';
import {useRefs} from '@/components/vc-tabs/src/save-ref';
import {defineComponent, getCurrentInstance} from 'vue';
/**
 * Wrap of sub component which need use as Button capacity (like Icon component).
 * This helps accessibility reader to tread as a interactive button to operation.
 */
import KeyCode from './keycode';
import PropTypes from './vue-types';

const inlineStyle = {
  border: 0,
  background: 'transparent',
  padding: 0,
  lineHeight: 'inherit',
  display: 'inline-block'
};

const TransButton = defineComponent({
  props: {
    noStyle: PropTypes.bool
  },
  setup($props, {emit}) {
    const onKeyDown = (event) => {
      const {keyCode} = event;
      if (keyCode === KeyCode.ENTER) {
        event.preventDefault();
      }
    };
    const onKeyUp = (event) => {
      const {keyCode} = event;
      if (keyCode === KeyCode.ENTER) {
        emit('click', event);
      }
    };
    const {saveRef, getRef} = useRefs();
    const focus = () => {
      if (getRef('div')) {
        getRef('div').focus();
      }
    };
    const blur = () => {
      if (getRef('div')) {
        getRef('div').blur();
      }
    };


    return {
      onKeyDown,
      onKeyUp,
      focus,
      blur,
      saveRef
    };
  },
  render() {
    const instance = getCurrentInstance();
    const {noStyle} = this.$props;
    return (
        <div
            {...getListenersFromInstance(instance)}
            onKeydown={this.onKeyDown}
            onKeyup={this.onKeyUp}
            role="button"
            tabIndex={0}
            ref={this.saveRef('div')}
            style={{...(noStyle ? null : inlineStyle)}}
        >
          {this.$slots.default && this.$slots.default()}
        </div>
    );
  }
}) as any;

export default TransButton;
