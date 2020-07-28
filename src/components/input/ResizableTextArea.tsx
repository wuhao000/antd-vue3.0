import classNames from 'classnames';
import omit from 'omit.js';
import {defineComponent, h, nextTick, onBeforeUnmount, onMounted, ref, watch} from 'vue';
import raf from '../_util/raf';
import PropTypes from '../_util/vue-types';
import warning from '../_util/warning';
import ResizeObserver from '../vc-resize-observer';
import calculateNodeHeight from './calculateNodeHeight';
import inputProps from './inputProps';

const RESIZE_STATUS_NONE = 0;
const RESIZE_STATUS_RESIZING = 1;
const RESIZE_STATUS_RESIZED = 2;

const TextAreaProps = {
  ...inputProps,
  autosize: PropTypes.oneOfType([Object, Boolean]),
  autoSize: PropTypes.oneOfType([Object, Boolean])
};
const ResizableTextArea: any = defineComponent({
  name: 'ResizableTextArea',
  props: TextAreaProps,
  setup(props, {emit, attrs}) {
    const textareaStyles = ref({});
    const resizeStatus = ref(RESIZE_STATUS_NONE);
    const nextFrameActionId = ref(null);
    const resizeFrameId = ref(null);
    const textAreaRef = ref(null);
    onMounted(() => {
      resizeTextarea();
    });
    onBeforeUnmount(() => {
      raf.cancel(nextFrameActionId.value);
      raf.cancel(resizeFrameId.value);
    });
    watch(() => props.value, () => {
      nextTick(() => {
        resizeTextarea();
      });
    });
    const handleResize = (size: string) => {
      const {autoSize} = props;

      if (resizeStatus.value !== RESIZE_STATUS_NONE) {
        return;
      }
      emit('resize', size);
      if (autoSize) {
        resizeOnNextFrame();
      }
    };
    const resizeOnNextFrame = () => {
      raf.cancel(nextFrameActionId.value);
      nextFrameActionId.value = raf(resizeTextarea);
    };

    const resizeTextarea = () => {
      const autoSize = props.autoSize || props.autosize;
      if (!autoSize || !textAreaRef.value) {
        return;
      }
      const {minRows, maxRows} = autoSize;
      textareaStyles.value = calculateNodeHeight(textAreaRef.value, false, minRows, maxRows);
      resizeStatus.value = RESIZE_STATUS_RESIZING;
      nextTick(() => {
        raf.cancel(resizeFrameId.value);
        resizeFrameId.value = raf(() => {
          resizeStatus.value = RESIZE_STATUS_RESIZED;
          nextTick(() => {
            resizeFrameId.value = raf(() => {
              resizeStatus.value = RESIZE_STATUS_NONE;
              fixFirefoxAutoScroll();
            });
          });
        });
      });
    };
    // https://github.com/ant-design/ant-design/issues/21870
    const fixFirefoxAutoScroll = () => {
      try {
        if (document.activeElement === textAreaRef.value) {
          const currentStart = textAreaRef.value.selectionStart;
          const currentEnd = textAreaRef.value.selectionEnd;
          textAreaRef.value.setSelectionRange(currentStart, currentEnd);
        }
      } catch (e) {
        // Fix error in Chrome:
        // Failed to read the 'selectionStart' property from 'HTMLInputElement'
        // http://stackoverflow.com/q/21177489/3040605
      }
    };

    const renderTextArea = () => {
      const {prefixCls, autoSize, autosize, disabled} = props;
      warning(
          autosize === undefined,
          'Input.TextArea',
          'autosize is deprecated, please use autoSize instead.'
      );
      const otherProps = omit(props, [
        'prefixCls',
        'autoSize',
        'autosize',
        'defaultValue',
        'allowClear',
        'type',
        'lazy',
        'value'
      ]);
      const cls = classNames(prefixCls, {
        [`${prefixCls}-disabled`]: disabled
      });
      const domProps: any = {};
      // Fix https://github.com/ant-design/ant-design/issues/6776
      // Make sure it could be reset when using form.getFieldDecorator
      if ('value' in props) {
        domProps.value = props.value || '';
      }
      const style = {
        ...textareaStyles.value,
        ...(resizeStatus.value === RESIZE_STATUS_RESIZING
            ? {overflowX: 'hidden', overflowY: 'hidden'}
            : null)
      };
      const textareaProps = {
        ...domProps,
        ...attrs,
        placeholder: props.placeholder,
        disabled: props.disabled,
        readonly: props.readOnly,
        style,
        class: cls,
        ref: (el) => {
          textAreaRef.value = el;
        }
      };
      return <ResizeObserver onResize={handleResize} disabled={!(autoSize || autosize)}>
        <textarea {...textareaProps}/>
      </ResizeObserver>;
    };
    return {textareaStyles, resizeTextarea, resizeStatus, renderTextArea};
  },
  render() {
    return this.renderTextArea();
  }
});

export default ResizableTextArea;
