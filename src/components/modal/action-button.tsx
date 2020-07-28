import {useRef} from '@/tools/ref';
import {defineComponent, onBeforeUnmount, onMounted, ref} from 'vue';
import PropTypes from '../_util/vue-types';
import Button from '../button';
import buttonTypes from '../button/buttonTypes';
import { useRefs } from '../vc-tabs/src/save-ref';

const ButtonType = buttonTypes().type;
const ActionButtonProps = {
  type: ButtonType,
  actionFn: PropTypes.func,
  closeModal: PropTypes.func,
  autoFocus: PropTypes.bool,
  buttonProps: PropTypes.object
};

export default defineComponent({
  props: ActionButtonProps,
  setup($props, {emit}) {
    const loading = ref(false);
    const onClick = () => {
      const {actionFn, closeModal} = $props;
      if (actionFn) {
        let ret;
        if (actionFn.length) {
          ret = actionFn(closeModal);
        } else {
          ret = actionFn();
          if (!ret) {
            closeModal();
          }
        }
        if (ret && ret.then) {
          loading.value = true;
          ret.then(
              (...args) => {
                // It's unnecessary to set loading=false, for the Modal will be unmounted after close.
                // this.setState({ loading: false });
                closeModal(...args);
              },
              e => {
                // Emit error when catch promise reject
                // eslint-disable-next-line no-console
                console.error(e);
                // See: https://github.com/ant-design/ant-design/issues/6183
                loading.value = false;
              }
          );
        }
      } else {
        closeModal();
      }
    };
    const timeoutId = ref(undefined);
    const {getRef, saveRef} = useRefs();
    onMounted(() => {
      if ($props.autoFocus) {
        timeoutId.value = setTimeout(() => getRef('root').el.focus());
      }
    });
    onBeforeUnmount(() => {
      clearTimeout(timeoutId.value);
    });
    return {
      onClick,
      loading,
      saveRef
    };
  },
  render() {
    const {type, $slots, loading, buttonProps} = this;
    return (
        <Button ref={this.saveRef('root')} type={type} onClick={this.onClick} loading={loading} {...buttonProps}>
          {$slots.default()}
        </Button>
    );
  }
}) as any;
