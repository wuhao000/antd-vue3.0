import {defineComponent, getCurrentInstance} from 'vue';
import ContainerRender from '../_util/container-render';
import {getClass, getClassFromInstance, getListenersFromInstance, getStyle} from '../_util/props-util';
import Dialog from './dialog';
import getDialogPropTypes from './IDialogPropTypes';

const IDialogPropTypes = getDialogPropTypes();
let openCount = 0;
const DialogWrap = defineComponent({
  inheritAttrs: false,
  props: {
    ...IDialogPropTypes,
    visible: IDialogPropTypes.visible.def(false)
  },
  data() {
    openCount = this.visible ? openCount + 1 : openCount;
    this.renderComponent = () => {
    };
    this.removeContainer = () => {
    };
    return {};
  },
  watch: {
    visible(val, preVal) {
      openCount = val && !preVal ? openCount + 1 : openCount - 1;
    }
  },
  beforeDestroy() {
    if (this.visible) {
      openCount = openCount ? openCount - 1 : openCount;
      this.renderComponent({
        afterClose: this.removeContainer,
        visible: false,
        on: {
          close() {
          }
        }
      });
    } else {
      this.removeContainer();
    }
  },
  setup() {
    const instance = getCurrentInstance();
    return {
      getComponent(extra = {}) {
        const {$attrs, $props, $slots, getContainer} = this;
        const dialogProps = {
          ...$props,
          dialogClass: getClassFromInstance(instance),
          dialogStyle: getStyle(instance),
          ...extra,
          getOpenCount: getContainer === false ? () => 2 : () => openCount,
          ...$attrs,
          ref: '_component',
          key: 'dialog',
          ...getListenersFromInstance(getCurrentInstance())
        };
        return <Dialog {...dialogProps}>{$slots.default}</Dialog>;
      },

      getContainer2() {
        const container = document.createElement('div');
        if (this.getContainer) {
          this.getContainer().appendChild(container);
        } else {
          document.body.appendChild(container);
        }
        return container;
      }
    }
  },
  render() {
    const {visible} = this;
    return this.getComponent();
    // return (
    //     <ContainerRender
    //         parent={this}
    //         visible={visible}
    //         autoDestroy={false}
    //         getComponent={this.getComponent}
    //         getContainer={this.getContainer2}
    //         children={({renderComponent, removeContainer}) => {
    //           this.renderComponent = renderComponent;
    //           this.removeContainer = removeContainer;
    //           return null;
    //         }}
    //     />
    // );
  }
});

export default DialogWrap;
