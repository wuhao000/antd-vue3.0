<template>
  <div class="code-box expand">
    <div class="code-box-demo">
      <slot/>
    </div>
    <div class="code-box-meta markdown" v-html="md">
    </div>
  </div>
</template>
<script lang="ts">
  import {markdown} from 'markdown';
  import {ref} from 'vue';

  export default {
    name: 'CodeBox',
    props: {
      meta: {type: String, default: ''}
    },
    setup(props) {
      const md = ref('');
      if (props.meta) {
        md.value = markdown.toHTML(props.meta);
      }
      return {md};
    }
  };
</script>
<style lang="less">
  .code-box-demo {
    border-bottom: 1px solid #ebedf0;
    padding: 42px 24px 50px;
    color: rgba(0, 0, 0, .65);
  }

  .code-box:target {
    border: 1px solid #1890ff
  }

  .code-box-expand-trigger {
    cursor: pointer;
    font-size: 18px;
    color: #3b4357;
    margin-left: 8px;
    opacity: .8;
    transition: all .3s;
    position: relative
  }

  .code-box-title {
    position: absolute;
    top: -14px;
    padding: 1px 8px;
    margin-left: -8px;
    color: #777;
    border-radius: 2px 2px 0 0;
    background: #fff;
    transition: background-color .4s
  }

  .code-box-title a, .code-box-title a:hover {
    color: #314659;
    font-size: 14px;
    font-weight: 500
  }

  .code-box-meta {
    &.markdown {
      border-radius: 0 0 2px 2px;
      font-size: 14px;
      position: relative;
      transition: background-color .4s;
      width: 100%;
    }
    blockquote {
      margin: 0 0 15px 24px
    }

    .demo-description > p,  & > p {
      font-size: 12px;
      margin: .5em 0;
      padding: 18px 24px 12px;
      width: 100%;
      word-break: break-word
    }
  }

  .code-box-meta h4, section.code-box-meta .demo-description > p, section.code-box-meta p {
    margin: 0;
    width: 98%
  }

  .code-box {
    border: 1px solid #ebedf0;
    border-radius: 2px;
    display: inline-block;
    width: 100%;
    position: relative;
    margin: 0 0 16px;
    transition: all .2s;
    &.expand .code-box-meta {
      border-bottom: 1px dashed #ebedf0;
      border-radius: 0;
    }
    a.edit-button {
      background: #fff;
      font-size: 12px;
      padding-right: 6px;
      position: absolute;
      right: -16px;
      text-decoration: none;
      top: 7px;
      transform: scale(.9);
    }
    iframe {
      border: 0;
      width: 100%;
    }
    .code-expand-icon {
      cursor: pointer
    }
    .code-expand-icon-hide, .code-expand-icon-show {
      -moz-user-select: none;
      -ms-user-select: none;
      -webkit-user-select: none;
      box-shadow: none;
      left: 0;
      margin: 0;
      max-width: 100%;
      position: absolute;
      top: 0;
      transition: all .4s;
      user-select: none;
      width: 100%;
    }

    .code-expand-icon-show {
      opacity: .55;
      pointer-events: auto
    }
    .code-expand-icon-show:hover, .code-expand-icon.ant-tooltip-open .code-expand-icon-show {
      opacity: 1
    }
    .code-expand-icon-hide {
      opacity: 0;
      pointer-events: none
    }
    .highlight-wrapper {
      border-radius: 0 0 2px 2px;
      display: none;
      overflow: auto;
    }
    .highlight-wrapper-expand {
      display: block;
    }
    .highlight {
      position: relative;
      pre {
        background: #fff;
        margin: 0;
        padding: 0;
      }
    }
  }
  .code-box-actions, .code-box .highlight:not(:first-child) {
    border-top: 1px dashed #ebedf0
  }

  .code-box-actions {
    padding-top: 12px;
    text-align: center;
    opacity: .7;
    transition: opacity .3s
  }

  .code-box-actions:hover {
    opacity: 1
  }

  .code-box-actions > form, .code-box-actions > i, .code-box-actions > span {
    display: inline-block;
    height: 16px;
    margin-left: 16px;
    position: relative;
    vertical-align: top;
    width: 16px;
  }

  .code-box-actions > form:first-child, .code-box-actions > i:first-child, .code-box-actions > span:first-child {
    margin-left: 0
  }

  .code-box-actions > form {
    top: -2px
  }

  .code-box-code-action {
    font-size: 16px;
    line-height: 18px
  }

  .code-box-code-action, .code-box-code-copy {
    color: #697b8c;
    cursor: pointer;
    height: 20px;
    transition: all .24s;
    width: 20px;
  }

  .code-box-code-copy {
    font-size: 14px;
    line-height: 20px;
    text-align: center;
    background: #fff;
    border-radius: 20px
  }

  .code-box-code-copy:hover {
    color: #697b8c;
    transform: scale(1.2)
  }

  .code-box-code-copy.anticon-check {
    color: #52c41a !important;
    font-weight: 700
  }

  .code-box-codepen {
    background: transparent url(https://gw.alipayobjects.com/zos/rmsportal/OtZslpOjYXijshDERXwc.svg) 50%/14px no-repeat
  }

  .code-box-codepen, .code-box-riddle {
    border: 0;
    cursor: pointer;
    height: 20px;
    opacity: 0;
    overflow: hidden;
    text-indent: -9999px;
    transition: all .3s;
    width: 20px;
  }

  .code-box-riddle {
    background: transparent url(https://gw.alipayobjects.com/zos/rmsportal/DlHbxMCyeuyOrqOdbgik.svg) 50%/14px no-repeat
  }

  .code-box-codesandbox {
    background: transparent url(https://gw.alipayobjects.com/zos/rmsportal/aaYmtdDyHSCkXyLZVgGK.svg) 50%/14px no-repeat;
    width: 20px;
    height: 20px;
    cursor: pointer;
    opacity: 0;
    transition: all .3s;
    border: 0;
    text-indent: -9999px;
    overflow: hidden
  }

  .code-box-meta .demo-description>h4, .code-box-meta>h4 {
    position: absolute;
    top: -14px;
    padding: 1px 8px;
    margin-left: 16px;
    color: #777;
    border-radius: 2px 2px 0 0;
    background: #fff;
    font-size: 14px;
    width: auto;
  }
</style>
