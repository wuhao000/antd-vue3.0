import {createApp, defineComponent, nextTick, ref, TransitionGroup} from 'vue';
import createChainedFunction from '../_util/create-chained-function';
import getTransitionProps from '../_util/get-transition-props';
import {getComponentFromContext, getStyleFromContext} from '../_util/props-util';
import PropTypes from '../_util/vue-types';
import Notice from './notice';

const TransitionGroup2 = TransitionGroup as any;
function noop() {
}

let seed = 0;
const now = Date.now();

function getUuid() {
  return `rcNotification_${now}_${seed++}`;
}

const Notification = defineComponent({
  props: {
    prefixCls: PropTypes.string.def('rc-notification'),
    transitionName: PropTypes.string,
    animation: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).def('fade'),
    maxCount: PropTypes.number,
    closeIcon: PropTypes.any
  },
  setup($props, {emit}) {
    const notices = ref([]);
    const getTransitionName = () => {
      const props = $props;
      let transitionName = props.transitionName;
      if (!transitionName && props.animation) {
        transitionName = `${props.prefixCls}-${props.animation}`;
      }
      return transitionName;
    };
    const add = (notice) => {
      const key = notice.key || getUuid();
      const {maxCount} = $props;
      const noticesV = notices.value;
      const noticeIndex = noticesV.map(v => v.key).indexOf(key);
      const updatedNotices = noticesV.concat();
      if (noticeIndex === -1) {
        if (maxCount && noticesV.length >= maxCount) {
          // XXX, use key of first item to update new added (let React to move exsiting
          // instead of remove and mount). Same key was used before for both a) external
          // manual control and b) internal react 'key' prop , which is not that good.
          notice.updateKey = updatedNotices[0].updateKey || updatedNotices[0].key;
          updatedNotices.shift();
        }
        updatedNotices.push(notice);
      } else {
        updatedNotices.splice(noticeIndex, 1, notice);
      }
      notices.value = updatedNotices;
    };
    const remove = (key) => {
      notices.value = notices.value.filter(notice => notice.key !== key);
    };
    return {
      getTransitionName,
      add,
      remove,
      notices
    };
  },
  render() {
    const {prefixCls, notices, remove, getTransitionName} = this;
    const transitionProps = getTransitionProps(getTransitionName());
    const noticeNodes = notices.map((notice, index) => {
      const update = Boolean(index === notices.length - 1 && notice.updateKey);
      const key = notice.updateKey ? notice.updateKey : notice.key;

      const {content, duration, closable, onClose, style, class: className} = notice;
      const close = createChainedFunction(remove.bind(this, notice.key), onClose);
      const noticeProps = {
        prefixCls,
        duration,
        closable,
        update,
        closeIcon: getComponentFromContext(this, 'closeIcon'),
        onClose: close,
        onClick: notice.onClick || noop,
        style,
        class: className,
        key
      };
      return (
          <Notice {...noticeProps}>{typeof content === 'function' ? content() : content}</Notice>
      );
    });
    const className = {
      [prefixCls]: 1
    };
    const style = getStyleFromContext(this);
    return (
        <div
            class={className}
            style={
              style || {
                top: '65px',
                left: '50%'
              }
            }>
          <TransitionGroup2 {...transitionProps}>{noticeNodes}</TransitionGroup2>
        </div>
    );
  }
}) as any;

Notification.newInstance = function newNotificationInstance(properties, callback) {
  const {getContainer, style, class: className, ...props} = properties || {};
  const div = document.createElement('div');
  if (getContainer) {
    const root = getContainer();
    root.appendChild(div);
  } else {
    document.body.appendChild(div);
  }
  const p = {
    ...props,
    style,
    class: className
  };
  const app = createApp(Notification, p);
  const notification: any = app.mount(div);
  nextTick(() => {
    callback({
      notice(noticeProps) {
        notification.add(noticeProps);
      },
      removeNotice(key) {
        notification.remove(key);
      },
      component: app,
      destroy() {
        app.unmount(div);
        div.parentNode.removeChild(div);
      }
    });
  });
};

export default Notification;
