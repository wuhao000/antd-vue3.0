import {defineComponent} from 'vue';
import {getListenersFromContext} from '../_util/props-util';
import {UploadProps} from './interface';
import Upload from './upload';

export default defineComponent({
  name: 'AUploadDragger',
  props: UploadProps,
  render() {
    const props = this.$props;
    const draggerProps = {
      ...props,
      type: 'drag',
      ...getListenersFromContext(this),
      style: {height: this.height}
    };
    return <Upload {...draggerProps}>{this.$slots.default && this.$slots.default()}</Upload>;
  }
});
