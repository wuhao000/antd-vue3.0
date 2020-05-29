import {defineComponent, getCurrentInstance, Teleport} from 'vue';
import {getClassFromInstance, getListenersFromInstance, getStyleFromInstance} from '../_util/props-util';
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
        onClose() {
        }
      });
    } else {
      this.removeContainer();
    }
  },
  setup(props, {attrs, slots}) {
    const instance = getCurrentInstance();
    return {
      getComponent(extra = {}) {
        const dialogProps = {
          ...props,
          dialogClass: getClassFromInstance(instance),
          dialogStyle: getStyleFromInstance(instance),
          ...extra,
          getOpenCount: props.getContainer === false ? () => 2 : () => openCount,
          ...attrs,
          ref: '_component',
          key: 'dialog',
          ...getListenersFromInstance(getCurrentInstance())
        };
        return <Dialog {...dialogProps}>{slots.default()}</Dialog>;
      }
    };
  },
  render() {
    const {visible} = this;
    const container = this.getContainer();
    // @ts-ignore
    return <Teleport to={container}>
      {this.getComponent()}
    </Teleport>;
  }
}) as any;

export default DialogWrap;
