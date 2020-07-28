import {getListenersFromContext} from '@/components/_util/props-util';
import {useRefs} from '@/components/vc-tabs/src/save-ref';
import classNames from 'classnames';
import partition from 'lodash/partition';
import {defineComponent, onBeforeUnmount, onMounted, ref} from 'vue';
import PropTypes from '../../_util/vue-types';
import attrAccept from './attr-accept';
import defaultRequest from './request';
import traverseFileTree from './traverse-file-tree';
import getUid from './uid';

const upLoadPropTypes = {
  componentTag: PropTypes.string,
  // style: PropTypes.object,
  prefixCls: PropTypes.string,
  name: PropTypes.string,
  // className: PropTypes.string,
  multiple: PropTypes.bool,
  directory: PropTypes.bool,
  disabled: PropTypes.bool,
  accept: PropTypes.string,
  // children: PropTypes.any,
  // onStart: PropTypes.func,
  data: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  action: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  method: PropTypes.string,
  headers: PropTypes.object,
  beforeUpload: PropTypes.func,
  customRequest: PropTypes.func,
  // onProgress: PropTypes.func,
  withCredentials: PropTypes.bool,
  openFileDialogOnClick: PropTypes.bool,
  transformFile: PropTypes.func
};

const AjaxUploader = defineComponent({
  inheritAttrs: false,
  name: 'ajaxUploader',
  props: upLoadPropTypes,
  setup($props, {emit}) {
    const reqs = ref([]);
    const uid = ref(getUid());
    const _isMounted = ref(false);
    const onChange = (e) => {
      const files = e.target.files;
      uploadFiles(files);
      reset();
    };
    const {getRef, saveRef} = useRefs();
    const onClick = () => {
      const el = getRef('fileInputRef');
      if (!el) {
        return;
      }
      el.click();
    };
    const onKeyDown = (e) => {
      if (e.key === 'Enter') {
        onClick();
      }
    };
    const onFileDrop = (e) => {
      const {multiple} = $props;
      e.preventDefault();
      if (e.type === 'dragover') {
        return;
      }
      if ($props.directory) {
        traverseFileTree(e.dataTransfer.items, uploadFiles, _file =>
            attrAccept(_file, $props.accept)
        );
      } else {
        const files = partition(Array.prototype.slice.call(e.dataTransfer.files), file =>
            attrAccept(file, $props.accept)
        );
        let successFiles = files[0];
        const errorFiles = files[1];
        if (multiple === false) {
          successFiles = successFiles.slice(0, 1);
        }
        uploadFiles(successFiles);

        if (errorFiles.length) {
          emit('reject', errorFiles);
        }
      }
    };
    const uploadFiles = (files) => {
      const postFiles = Array.prototype.slice.call(files);
      postFiles
          .map(file => {
            file.uid = getUid();
            return file;
          })
          .forEach(file => {
            upload(file, postFiles);
          });
    };
    const upload = (file, fileList) => {
      if (!$props.beforeUpload) {
        // always async in case use react state to keep fileList
        return setTimeout(() => post(file), 0);
      }

      const before = $props.beforeUpload(file, fileList);
      if (before && before.then) {
        before
            .then(processedFile => {
              const processedFileType = Object.prototype.toString.call(processedFile);
              if (processedFileType === '[object File]' || processedFileType === '[object Blob]') {
                return post(processedFile);
              }
              return post(file);
            })
            .catch(e => {
              console && console.log(e); // eslint-disable-line
            });
      } else if (before !== false) {
        setTimeout(() => post(file), 0);
      }
    };
    const post = (file) => {
      if (!_isMounted.value) {
        return;
      }
      let {data} = $props;
      const {transformFile = originFile => originFile} = $props;

      new Promise(resolve => {
        const {action} = $props;
        if (typeof action === 'function') {
          return resolve(action(file));
        }
        resolve(action);
      }).then(action => {
        const {uid} = file;
        const request = $props.customRequest || defaultRequest;
        const transform = Promise.resolve(transformFile(file)).catch(e => {
          console.error(e); // eslint-disable-line no-console
        });
        transform.then(transformedFile => {
          if (typeof data === 'function') {
            data = data(file);
          }

          const requestOption = {
            action,
            filename: name,
            data,
            file: transformedFile,
            headers: $props.headers,
            withCredentials: $props.withCredentials,
            method: $props.method || 'post',
            onProgress: e => {
              emit('progress', e, file);
            },
            onSuccess: (ret, xhr) => {
              delete reqs[uid];
              emit('success', ret, file, xhr);
            },
            onError: (err, ret) => {
              delete reqs[uid];
              emit('error', err, ret, file);
            }
          };
          reqs[uid] = request(requestOption);
          emit('start', file);
        });
      });
    };
    const reset = () => {
      uid.value = getUid();
    };
    const abort = (file?) => {
      if (file) {
        let uid = file;
        if (file && file.uid) {
          uid = file.uid;
        }
        if (reqs.value[uid] && reqs.value[uid].abort) {
          reqs.value[uid].abort();
        }
        delete reqs.value[uid];
      } else {
        Object.keys(reqs.value).forEach(uid => {
          if (reqs.value[uid] && reqs.value[uid].abort) {
            reqs.value[uid].abort();
          }

          delete reqs.value[uid];
        });
      }
    };
    onMounted(() => {
      _isMounted.value = true;
    });
    onBeforeUnmount(() => {
      _isMounted.value = false;
      abort();
    });

    return {
      onChange,
      onClick,
      onKeyDown,
      onFileDrop,
      uploadFiles,
      upload,
      post,
      reset,
      abort,
      saveRef,
      uid
    };
  },
  render() {
    const {$props, $attrs} = this;
    const {
      componentTag: Tag,
      prefixCls,
      disabled,
      multiple,
      accept,
      directory,
      openFileDialogOnClick
    } = $props;
    const cls = classNames({
      [prefixCls]: true,
      [`${prefixCls}-disabled`]: disabled
    });
    const events = disabled
        ? {}
        : {
          onClick: openFileDialogOnClick ? this.onClick : () => {
          },
          onKeydown: openFileDialogOnClick ? this.onKeyDown : () => {
          },
          onDrop: this.onFileDrop,
          onDragover: this.onFileDrop
        };
    const tagProps = {
      ...getListenersFromContext(this),
      ...events,
      role: 'button',
      tabIndex: disabled ? null : '0',
      class: cls
    };
    return (
        <Tag {...tagProps}>
          <input
              id={$attrs.id as string}
              type="file"
              ref={this.saveRef('fileInputRef')}
              onClick={e => e.stopPropagation()} // https://github.com/ant-design/ant-design/issues/19948
              key={this.uid}
              style={{display: 'none'}}
              accept={accept}
              multiple={multiple}
              onChange={this.onChange}
          />
          {this.$slots.default && this.$slots.default()}
        </Tag>
    );
  }
});

export default AjaxUploader;
