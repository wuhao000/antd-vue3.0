import animate from './css-animation';

const noop = () => {
};
const getTransitionProps = (transitionName, opt: any = {}) => {
  const {beforeEnter, enter, afterEnter, leave, afterLeave, appear = true, tag, nativeOn} = opt;
  const transitionProps = {
    appear,
    css: false,
    onBeforeEnter: beforeEnter || noop,
    onEnter:
        enter ||
        ((el, done) => {
          animate(el, `${transitionName}-enter`, done);
        }),
    onAfterEnter: afterEnter || noop,
    onLeave:
        leave ||
        ((el, done) => {
          animate(el, `${transitionName}-leave`, done);
        }),
    onAfterLeave: afterLeave || noop,
    ...nativeOn
  };
  // transition-group
  if (tag) {
    transitionProps.tag = tag;
  }
  return transitionProps;
};

export default getTransitionProps;
