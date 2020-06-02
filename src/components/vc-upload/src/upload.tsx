import {useRefs} from '@/components/vc-tabs/src/save-ref';
import {defineComponent, nextTick, onMounted, ref} from 'vue';
import {getListenersFromContext, initDefaultProps} from '../../_util/props-util';
import PropTypes from '../../_util/vue-types';
import AjaxUpload from './ajax-uploader';
import IframeUpload from './iframe-uploader';

function empty() {
}

const uploadProps = {
  componentTag: PropTypes.string,
  prefixCls: PropTypes.string,
  action: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  name: PropTypes.string,
  multipart: PropTypes.bool,
  directory: PropTypes.bool,
  // onError: PropTypes.func,
  // onSuccess: PropTypes.func,
  // onProgress: PropTypes.func,
  // onStart: PropTypes.func,
  data: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  headers: PropTypes.object,
  accept: PropTypes.string,
  multiple: PropTypes.bool,
  disabled: PropTypes.bool,
  beforeUpload: PropTypes.func,
  customRequest: PropTypes.func,
  // onReady: PropTypes.func,
  withCredentials: PropTypes.bool,
  supportServerRender: PropTypes.bool,
  openFileDialogOnClick: PropTypes.bool
};
export default defineComponent({
  name: 'Upload',
  inheritAttrs: false,
  props: initDefaultProps(uploadProps, {
    componentTag: 'span',
    prefixCls: 'rc-upload',
    data: {},
    headers: {},
    name: 'file',
    multipart: false,
    // onReady: empty,
    // onStart: empty,
    // onError: empty,
    // onSuccess: empty,
    supportServerRender: false,
    multiple: false,
    beforeUpload: empty,
    withCredentials: false,
    openFileDialogOnClick: true
  }),
  setup($props, {emit}) {
    const component = ref(null);
    const {getRef, saveRef} = useRefs();
    const getComponent = () => {
      return typeof File !== 'undefined' ? AjaxUpload : IframeUpload;
    };
    const abort = (file) => {
      getRef('uploaderRef').abort(file);
    };
    onMounted(() => {
      nextTick(() => {
        if ($props.supportServerRender) {
          component.value = getComponent();
          nextTick(() => {
            emit('ready');
          });
        }
      });
    });

    return {
      getComponent,
      abort,
      saveRef,
      component
    };
  },
  render() {
    const componentProps = {
      ...this.$attrs,
      ...this.$props,
      ...getListenersFromContext(this),
      ref: this.saveRef('uploaderRef')
    };
    if (this.supportServerRender) {
      const ComponentUploader = this.component;
      if (ComponentUploader) {
        return <ComponentUploader {...componentProps}>{
          this.$slots.default && this.$slots.default()
        }</ComponentUploader>;
      }
      return null;
    }
    const ComponentUploader: any = this.getComponent();
    return <ComponentUploader {...componentProps}>{
      this.$slots.default && this.$slots.default()
    }</ComponentUploader>;
  }
});
