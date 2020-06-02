import {useRefs} from '@/components/vc-tabs/src/save-ref';
import classNames from 'classnames';
import {CSSProperties, defineComponent, nextTick, onMounted, onUpdated, ref} from 'vue';
import PropTypes from '../../_util/vue-types';
import warning from '../../_util/warning';
import getUid from './uid';

const IFRAME_STYLE: CSSProperties = {
  top: '0',
  opacity: '0',
  filter: 'alpha(opacity=0)',
  left: '0',
  zIndex: 9999
};

// diferent from AjaxUpload, can only upload on at one time, serial seriously
const IframeUploader = defineComponent({
  props: {
    componentTag: PropTypes.string,
    beforeUpload: PropTypes.func,
    // style: PropTypes.object,
    disabled: PropTypes.bool,
    prefixCls: PropTypes.string,
    // className: PropTypes.string,
    accept: PropTypes.string,
    // onStart: PropTypes.func,
    multiple: PropTypes.bool,
    // children: PropTypes.any,
    data: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
    action: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    name: PropTypes.string
  },
  data() {
    return {
      uploading: false
    };
  },
  setup($props, {emit}) {
    const domain = ref(undefined);
    const file = ref<any>({});
    const uploading = ref(false);
    const onLoad = () => {
      if (!uploading.value) {
        return;
      }
      let response;
      try {
        const doc = getIframeDocument();
        const script = doc.getElementsByTagName('script')[0];
        if (script && script.parentNode === doc.body) {
          doc.body.removeChild(script);
        }
        response = doc.body.innerHTML;
        emit('success', response, file.value);
      } catch (err) {
        warning(
            false,
            'cross domain error for Upload. Maybe server should return document.domain script. see Note from https://github.com/react-component/upload'
        );
        response = 'cross-domain';
        emit('error', err, null, file.value);
      }
      endUpload();
    };
    const onChange = () => {
      const target = getFormInputNode();
      // ie8/9 don't support FileList Object
      // http://stackoverflow.com/questions/12830058/ie8-input-type-file-get-files
      const localFile = {
        uid: getUid(),
        name:
            target.value &&
            target.value.substring(target.value.lastIndexOf('\\') + 1, target.value.length)
      };
      file.value = localFile;
      startUpload();
      if (!$props.beforeUpload) {
        return post(localFile);
      }
      const before = $props.beforeUpload(localFile);
      if (before && before.then) {
        before.then(
            () => {
              post(localFile);
            },
            () => {
              endUpload();
            }
        );
      } else if (before !== false) {
        post(localFile);
      } else {
        endUpload();
      }
    };
    const {getRef, saveRef} = useRefs();
    const getIframeNode = () => {
      return getRef('iframeRef');
    };
    const getIframeDocument = () => {
      return getIframeNode().contentDocument;
    };
    const getFormNode = () => {
      return getIframeDocument().getElementById('form');
    };
    const getFormInputNode = () => {
      return getIframeDocument().getElementById('input');
    };
    const getFormDataNode = () => {
      return getIframeDocument().getElementById('data');
    };
    const getFileForMultiple = (file) => {
      return $props.multiple ? [file] : file;
    };
    const getIframeHTML = (domain) => {
      let domainScript = '';
      let domainInput = '';
      if (domain) {
        const script = 'script';
        domainScript = `<${script}>document.domain="${domain}";</${script}>`;
        domainInput = `<input name="_documentDomain" value="${domain}" />`;
      }
      return `<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <style>
    body, html {
      padding: 0;
      margin: 0;
      border: 0;
      overflow: hidden;
    }
  </style>
  ${domainScript}
</head>
<body>
<form method="post"
      encType="multipart/form-data"
      action="" id="form"
      style="display:block;height:9999px;position:relative;overflow:hidden;">
  <input id="input" type="file"
         name="${name}"
         style="position:absolute;top:0;right:0;height:9999px;font-size:9999px;cursor:pointer;"/>
  ${domainInput}
  <span id="data"></span>
</form>
</body>
</html>
      `;
    };
    const initIframeSrc = () => {
      if (domain.value) {
        getIframeNode().src = `javascript:void((function(){
          var d = document;
          d.open();
          d.domain='${domain.value}';
          d.write('');
          d.close();
        })())`;
      }
    };
    const initIframe = () => {
      const iframeNode = getIframeNode();
      let win = iframeNode.contentWindow;
      let doc;
      domain.value = domain.value || '';
      initIframeSrc();
      try {
        doc = win.document;
      } catch (e) {
        domain.value = document.domain;
        initIframeSrc();
        win = iframeNode.contentWindow;
        doc = win.document;
      }
      doc.open('text/html', 'replace');
      doc.write(getIframeHTML(domain.value));
      doc.close();
      getFormInputNode().onchange = onChange;
    };
    const endUpload = () => {
      if (uploading) {
        file.value = {};
        // hack avoid batch
        uploading.value = false;
        initIframe();
      }
    };
    const startUpload = () => {
      if (!uploading) {
        uploading.value = true;
      }
    };
    const updateIframeWH = () => {
      const rootNode = getRef('root');
      const iframeNode = getIframeNode();
      iframeNode.style.height = `${rootNode.offsetHeight}px`;
      iframeNode.style.width = `${rootNode.offsetWidth}px`;
    };
    const abort = (localFile) => {
      if (localFile) {
        let uid = localFile;
        if (localFile && localFile.uid) {
          uid = localFile.uid;
        }
        if (uid === file.value.uid) {
          endUpload();
        }
      } else {
        endUpload();
      }
    };
    const post = (file) => {
      const formNode = getFormNode();
      const dataSpan = getFormDataNode();
      let {data} = $props;
      if (typeof data === 'function') {
        data = data(file);
      }
      const inputs = document.createDocumentFragment();
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          const input = document.createElement('input');
          input.setAttribute('name', key);
          input.value = data[key];
          inputs.appendChild(input);
        }
      }
      dataSpan.appendChild(inputs);
      new Promise(resolve => {
        const {action} = $props;
        if (typeof action === 'function') {
          return resolve(action(file));
        }
        resolve(action);
      }).then(action => {
        formNode.setAttribute('action', action);
        formNode.submit();
        dataSpan.innerHTML = '';
        emit('start', file);
      });
    };
    onMounted(() => {
      nextTick(() => {
        updateIframeWH();
        initIframe();
      });
    });
    onUpdated(() => {
      nextTick(() => {
        updateIframeWH();
      });
    });

    return {
      onLoad,
      onChange,
      getIframeNode,
      getIframeDocument,
      getFormNode,
      getFormInputNode,
      getFormDataNode,
      getFileForMultiple,
      getIframeHTML,
      initIframeSrc,
      initIframe,
      endUpload,
      startUpload,
      updateIframeWH,
      abort,
      post,
      saveRef
    };
  },
  render() {
    const {componentTag: Tag, disabled, prefixCls} = this.$props;
    const iframeStyle: CSSProperties = {
      ...IFRAME_STYLE,
      display: this.uploading || disabled ? 'none' : ''
    };
    const cls = classNames({
      [prefixCls]: true,
      [`${prefixCls}-disabled`]: disabled
    });

    return (
        <Tag ref={this.saveRef('root')} className={cls} style={{position: 'relative', zIndex: 0}}>
          <iframe ref="iframeRef" onLoad={this.onLoad} style={iframeStyle}/>
          {this.$slots.default && this.$slots.default()}
        </Tag>
    );
  }
});

export default IframeUploader;
