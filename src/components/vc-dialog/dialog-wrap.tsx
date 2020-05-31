import {defineComponent, getCurrentInstance, Teleport, watch} from 'vue';
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
  setup(props, {attrs, slots}) {
    openCount = props.visible ? openCount + 1 : openCount;
    watch(() => props.visible, (val, preVal) => {
      openCount = val && !preVal ? openCount + 1 : openCount - 1;
    });
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
    const container = this.getContainer();
    // @ts-ignore
    return <Teleport to={container}>
      {this.getComponent()}
    </Teleport>;
  }
}) as any;

export default DialogWrap;
