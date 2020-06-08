import {useRefs} from '@/components/vc-tabs/src/save-ref';
import {useLocalValue} from '@/tools/value';
import classNames from 'classnames';
import findIndex from 'lodash/findIndex';
import pick from 'lodash/pick';
import uniqBy from 'lodash/uniqBy';
import {defineComponent, onBeforeUnmount, ref} from 'vue';
import {getListenersFromContext, initDefaultProps} from '../_util/props-util';
import {useConfigProvider} from '../config-provider';
import defaultLocale from '../locale-provider/default';
import VcUpload from '../vc-upload';
import Dragger from './dragger';
import {UploadProps} from './interface';
import UploadList from './upload-list';
import {fileToObject, genPercentAdd, getFileItem, removeFileItem, T} from './utils';

export {UploadProps};

export default defineComponent({
  name: 'AUpload',
  inheritAttrs: false,
  Dragger,
  props: initDefaultProps(UploadProps, {
    type: 'select',
    multiple: false,
    action: '',
    data: () => {},
    accept: '',
    beforeUpload: () => T,
    showUploadList: true,
    listType: 'text', // or pictrue
    disabled: false,
    supportServerRender: false
  }),
  setup($props, {emit, attrs: $attrs}) {
    const {value: sFileList, setValue: setFileList} = useLocalValue($props.defaultFileList || [], 'fileList');
    const dragState = ref('drop');
    const progressTimer = ref(null);
    const onStart = (file) => {
      const targetItem = fileToObject(file);
      targetItem.status = 'uploading';
      const nextFileList = sFileList.value.concat();
      const fileIndex = findIndex(nextFileList, ({uid}) => uid === targetItem.uid);
      if (fileIndex === -1) {
        nextFileList.push(targetItem);
      } else {
        nextFileList[fileIndex] = targetItem;
      }
      onChange({
        file: targetItem,
        fileList: nextFileList
      });
      // fix ie progress
      if (!window.File || process.env.TEST_IE) {
        autoUpdateProgress(0, targetItem);
      }
    };
    const onSuccess = (response, file, xhr) => {
      clearProgressTimer();
      let copyResponse = response;
      try {
        if (typeof copyResponse === 'string') {
          copyResponse = JSON.parse(copyResponse);
        }
      } catch (e) {
        /* do nothing */
      }
      const fileList = sFileList.value;
      const targetItem = getFileItem(file, fileList);
      // removed
      if (!targetItem) {
        return;
      }
      targetItem.status = 'done';
      targetItem.response = copyResponse;
      targetItem.xhr = xhr;
      onChange({
        file: {...targetItem},
        fileList
      });
    };
    const {getRef, saveRef} = useRefs();
    const onProgress = (e, file) => {
      const fileList = sFileList.value;
      const targetItem = getFileItem(file, fileList);
      // removed
      if (!targetItem) {
        return;
      }
      targetItem.percent = e.percent;
      onChange({
        event: e,
        file: {...targetItem},
        fileList: sFileList.value
      });
    };
    const onError = (error, response, file) => {
      clearProgressTimer();
      const fileList = sFileList.value;
      const targetItem = getFileItem(file, fileList);
      // removed
      if (!targetItem) {
        return;
      }
      targetItem.error = error;
      targetItem.response = response;
      targetItem.status = 'error';
      onChange({
        file: {...targetItem},
        fileList
      });
    };
    const onReject = (fileList) => {
      emit('reject', fileList);
    };
    const handleRemove = (file) => {
      const onRemove = $props.remove;
      const fileList = sFileList.value;
      Promise.resolve(typeof onRemove === 'function' ? onRemove(file) : onRemove).then(ret => {
        // Prevent removing file
        if (ret === false) {
          return;
        }

        const removedFileList = removeFileItem(file, fileList);

        if (removedFileList) {
          file.status = 'removed'; // eslint-disable-line
          onChange({
            file,
            fileList: removedFileList
          });
        }
      });
    };
    const handleManualRemove = (file) => {
      if (getRef('uploadRef')) {
        getRef('uploadRef').abort(file);
      }
      handleRemove(file);
    };
    const onChange = (info) => {
      setFileList(info.fileList);
      emit('change', info);
    };
    const onFileDrop = (e) => {
      dragState.value = e.type;
    };
    const reBeforeUpload = (file, fileList) => {
      const {beforeUpload} = $props;
      const stateFileList = sFileList.value;
      if (!beforeUpload) {
        return true;
      }
      const result = beforeUpload(file, fileList);
      if (result === false) {
        onChange({
          file,
          fileList: uniqBy(stateFileList.concat(fileList.map(fileToObject)), item => item.uid)
        });
        return false;
      }
      if (result && result.then) {
        return result;
      }
      return true;
    };
    const clearProgressTimer = () => {
      clearInterval(progressTimer.value);
    };
    const autoUpdateProgress = (_, file) => {
      const getPercent = genPercentAdd();
      let curPercent = 0;
      clearProgressTimer();
      progressTimer.value = setInterval(() => {
        curPercent = getPercent(curPercent);
        onProgress(
            {
              percent: curPercent * 100
            },
            file
        );
      }, 200);
    };
    const renderUploadList = (locale) => {
      const {
        showUploadList = {},
        listType,
        previewFile,
        disabled,
        locale: propLocale
      } = $props;
      const {showRemoveIcon, showPreviewIcon, showDownloadIcon} = showUploadList;
      const fileList = sFileList.value;
      const uploadListProps = {
        listType,
        items: fileList,
        previewFile,
        showRemoveIcon: !disabled && showRemoveIcon,
        showPreviewIcon,
        showDownloadIcon,
        locale: {...locale, ...propLocale},
        onRemove: handleManualRemove,
        ...pick(getListenersFromContext({$props, $attrs}), ['onDownload', 'onPreview']) // 如果没有配置该事件，不要传递，
        // uploadlist 会有相应逻辑
      };
      return <UploadList {...uploadListProps} />;
    };
    onBeforeUnmount(() => {
      clearProgressTimer();
    });

    return {
      onStart,
      onSuccess,
      onProgress,
      onError,
      onReject,
      handleRemove,
      handleManualRemove,
      onChange,
      onFileDrop,
      reBeforeUpload,
      clearProgressTimer,
      autoUpdateProgress,
      renderUploadList,
      saveRef,
      sFileList,
      dragState,
      configProvider: useConfigProvider()
    };
  },
  render() {
    const {
      prefixCls: customizePrefixCls,
      showUploadList,
      listType,
      type,
      disabled,
      dragState,
      sFileList: fileList
    } = this;
    const getPrefixCls = this.configProvider.getPrefixCls;
    const prefixCls = getPrefixCls('upload', customizePrefixCls);
    const vcUploadProps: any = {
      ...this.$props,
      prefixCls,
      beforeUpload: this.reBeforeUpload,
      onStart: this.onStart,
      onError: this.onError,
      onProgress: this.onProgress,
      onSuccess: this.onSuccess,
      onReject: this.onReject,
      ref: this.saveRef('uploadRef'),
      ...this.$attrs
    };

    const uploadList = showUploadList ?
        this.renderUploadList(defaultLocale.Upload) : null;

    const children = this.$slots.default && this.$slots.default();

    if (type === 'drag') {
      const dragCls = classNames(prefixCls, {
        [`${prefixCls}-drag`]: true,
        [`${prefixCls}-drag-uploading`]: fileList.some(file => file.status === 'uploading'),
        [`${prefixCls}-drag-hover`]: dragState === 'dragover',
        [`${prefixCls}-disabled`]: disabled
      });
      return (
          <span>
          <div
              class={dragCls}
              onDrop={this.onFileDrop}
              onDragover={this.onFileDrop}
              onDragleave={this.onFileDrop}
          >
            <VcUpload {...vcUploadProps} class={`${prefixCls}-btn`}>
              <div class={`${prefixCls}-drag-container`}>{children}</div>
            </VcUpload>
          </div>
            {uploadList}
        </span>
      );
    }

    const uploadButtonCls = classNames(prefixCls, {
      [`${prefixCls}-select`]: true,
      [`${prefixCls}-select-${listType}`]: true,
      [`${prefixCls}-disabled`]: disabled
    });

    // Remove id to avoid open by label when trigger is hidden
    // https://github.com/ant-design/ant-design/issues/14298
    if (!children || disabled) {
      delete vcUploadProps.id;
    }

    const uploadButton = (
        <div class={uploadButtonCls} style={children ? undefined : {display: 'none'}}>
          <VcUpload {...vcUploadProps}>{children}</VcUpload>
        </div>
    );

    if (listType === 'picture-card') {
      return (
          <span class={`${prefixCls}-picture-card-wrapper`}>
            {uploadList}
            {uploadButton}
          </span>
      );
    }
    return (
        <span>
        {uploadButton}
          {uploadList}
      </span>
    );
  }
});
