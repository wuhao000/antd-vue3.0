import debounce from 'lodash/debounce';
import ResizeObserver from 'resize-observer-polyfill';
import {
  defineComponent,
  Fragment,
  getCurrentInstance,
  nextTick,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  ref,
  watch
} from 'vue';
import {getComponentFromProp} from '../../_util/props-util';
import PropTypes from '../../_util/vue-types';
import {isTransform3dSupported, setTransform} from './utils';

const DEFAULT_DEBOUNCE_TIME = 200;

function noop() {
}

export default defineComponent({
  name: 'ScrollableTabBarNode',
  inheritAttrs: false,
  props: {
    activeKey: PropTypes.any,
    getRef: PropTypes.func.def(() => {
    }),
    saveRef: PropTypes.func.def(() => {
    }),
    tabBarPosition: PropTypes.oneOf(['left', 'right', 'top', 'bottom']).def('left'),
    prefixCls: PropTypes.string.def(''),
    scrollAnimated: PropTypes.bool.def(true),
    navWrapper: PropTypes.func.def(() => (arg => arg)),
    prevIcon: PropTypes.any,
    nextIcon: PropTypes.any,
    direction: PropTypes.string
  },
  setup(props, {emit}) {
    const instance = getCurrentInstance();
    const offset = ref(0);
    const prevProps = ref({...props});
    const next = ref(false);
    const lastNextPrevShown = ref(undefined);
    const prev = ref(false);
    watch(() => props.tabBarPosition, () => {
      nextTick(() => {
        setOffset(0);
      });
    });
    const updatedCal = (prevProps?) => {
      if (prevProps && prevProps.tabBarPosition !== props.tabBarPosition) {
        setOffset(0);
        return;
      }
      // wait next, prev show hide
      if (isNextPrevShown({prev: prev.value, next: next.value}) !== isNextPrevShown(setNextPrev())) {
        nextTick(() => {
          scrollToActiveTab();
        });
      } else if (!prevProps || props.activeKey !== prevProps.activeKey) {
        // can not use props.activeKey
        scrollToActiveTab();
      }
    };
    const setNextPrev = () => {
      const navNode = props.getRef('nav');
      const navTabsContainer = props.getRef('navTabsContainer');
      const navNodeWH = getScrollWH(navTabsContainer || navNode);
      // Add 1px to fix `offsetWidth` with decimal in Chrome not correct handle
      // https://github.com/ant-design/ant-design/issues/13423
      const containerWH = getOffsetWH(props.getRef('container')) + 1;
      const navWrapNodeWH = getOffsetWH(props.getRef('navWrap'));
      let localOffset = offset.value;
      const minOffset = containerWH - navNodeWH;
      let localNext = next.value;
      if (minOffset >= 0) {
        localNext = false;
        setOffset(0, false);
        localOffset = 0;
      } else if (minOffset < localOffset) {
        localNext = true;
      } else {
        localNext = false;
        // Fix https://github.com/ant-design/ant-design/issues/8861
        // Test with container offset which is stable
        // and set the offset of the nav wrap node
        const realOffset = navWrapNodeWH - navNodeWH;
        setOffset(realOffset, false);
        localOffset = realOffset;
      }
      const localPrev = localOffset < 0;
      setNext(localNext);
      setPrev(localPrev);
      return {
        next: localNext,
        prev: localPrev
      };
    };
    const getOffsetWH = (node) => {
      const tabBarPosition = props.tabBarPosition;
      let prop = 'offsetWidth';
      if (tabBarPosition === 'left' || tabBarPosition === 'right') {
        prop = 'offsetHeight';
      }
      return node[prop];
    };
    const getScrollWH = (node) => {
      const tabBarPosition = props.tabBarPosition;
      let prop = 'scrollWidth';
      if (tabBarPosition === 'left' || tabBarPosition === 'right') {
        prop = 'scrollHeight';
      }
      return node[prop];
    };
    const getOffsetLT = (node) => {
      const tabBarPosition = props.tabBarPosition;
      let prop = 'left';
      if (tabBarPosition === 'left' || tabBarPosition === 'right') {
        prop = 'top';
      }
      return node.getBoundingClientRect()[prop];
    };
    const setOffset = (localOffset, checkNextPrev = true) => {
      let target = Math.min(0, localOffset);
      if (offset.value !== target) {
        offset.value = target;
        let navOffset: { name?: any, value?: any };
        const tabBarPosition = props.tabBarPosition;
        const navStyle = props.getRef('nav').style;
        const transformSupported = isTransform3dSupported(navStyle);
        if (tabBarPosition === 'left' || tabBarPosition === 'right') {
          if (transformSupported) {
            navOffset = {
              value: `translate3d(0,${target}px,0)`
            };
          } else {
            navOffset = {
              name: 'top',
              value: `${target}px`
            };
          }
        } else if (transformSupported) {
          if (props.direction === 'rtl') {
            target = -target;
          }
          navOffset = {
            value: `translate3d(${target}px,0,0)`
          };
        } else {
          navOffset = {
            name: 'left',
            value: `${target}px`
          };
        }
        if (transformSupported) {
          setTransform(navStyle, navOffset.value);
        } else {
          navStyle[navOffset.name] = navOffset.value;
        }
        if (checkNextPrev) {
          setNextPrev();
        }
      }
    };
    const setPrev = (v) => {
      if (prev.value !== v) {
        prev.value = v;
      }
    };
    const setNext = (v) => {
      if (!v) {
        // debugger
      }
      if (next.value !== v) {
        next.value = v;
      }
    };
    const isNextPrevShown = (state?) => {
      if (state) {
        return state.next || state.prev;
      }
      return next.value || prev.value;
    };
    const prevTransitionEnd = (e) => {
      if (e.propertyName !== 'opacity') {
        return;
      }
      const container = props.getRef('container');
      scrollToActiveTab({
        target: container,
        currentTarget: container
      });
    };
    const scrollToActiveTab = (e?) => {
      const activeTab = props.getRef('activeTab');
      const navWrap = props.getRef('navWrap');
      if ((e && e.target !== e.currentTarget) || !activeTab) {
        return;
      }

      // when not scrollable or enter scrollable first time, don't emit scrolling
      const needToSroll = isNextPrevShown() && lastNextPrevShown.value;
      lastNextPrevShown.value = isNextPrevShown();
      if (!needToSroll) {
        return;
      }
      const activeTabWH = getScrollWH(activeTab);
      const navWrapNodeWH = getOffsetWH(navWrap);
      const wrapOffset = getOffsetLT(navWrap);
      const activeTabOffset = getOffsetLT(activeTab);
      if (wrapOffset > activeTabOffset) {
        offset.value += wrapOffset - activeTabOffset;
        setOffset(offset.value);
      } else if (wrapOffset + navWrapNodeWH < activeTabOffset + activeTabWH) {
        offset.value -= activeTabOffset + activeTabWH - (wrapOffset + navWrapNodeWH);
        setOffset(offset.value);
      }
    };
    const prevClick = (e) => {
      emit('prevClick', e);
      const navWrapNode = props.getRef('navWrap');
      const navWrapNodeWH = getOffsetWH(navWrapNode);
      setOffset(offset.value + navWrapNodeWH);
    };
    const nextClick = (e) => {
      emit('nextClick', e);
      const navWrapNode = props.getRef('navWrap');
      const navWrapNodeWH = getOffsetWH(navWrapNode);
      setOffset(offset.value - navWrapNodeWH);
    };
    let debouncedResize = null;
    let resizeObserver = null;
    onMounted(() => {
      nextTick(() => {
        updatedCal();
        debouncedResize = debounce(() => {
          setNextPrev();
          scrollToActiveTab();
        }, DEFAULT_DEBOUNCE_TIME);
        resizeObserver = new ResizeObserver(debouncedResize);
        resizeObserver.observe(props.getRef('container'));
      });
    });
    onUpdated(() => {
      nextTick(() => {
        updatedCal(prevProps.value);
        prevProps.value = {...props};
      });
    });
    onBeforeUnmount(() => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (debouncedResize && debouncedResize.cancel) {
        debouncedResize.cancel();
      }
    });
    const renderPrevNextBtn = () => {
      const prevIcon = getComponentFromProp(instance, 'prevIcon');
      const nextIcon = getComponentFromProp(instance, 'nextIcon');
      const showNextPrev = prev.value || next.value;
      const prefixCls = props.prefixCls;
      const prevButton = (
          <span
              onClick={prev.value ? prevClick : () => {
              }}
              unselectable="on"
              class={{
                [`${prefixCls}-tab-prev`]: 1,
                [`${prefixCls}-tab-btn-disabled`]: !prev.value,
                [`${prefixCls}-tab-arrow-show`]: showNextPrev
              }}
              onTransitionend={prevTransitionEnd}
          >
            {prevIcon || <span class={`${prefixCls}-tab-prev-icon`}/>}
          </span>
      );
      const nextButton = (
          <span onClick={next.value ? nextClick : undefined}
                unselectable="on"
                class={{
                  [`${prefixCls}-tab-next`]: 1,
                  [`${prefixCls}-tab-btn-disabled`]: !next.value,
                  [`${prefixCls}-tab-arrow-show`]: showNextPrev
                }}>
            {nextIcon || <span class={`${prefixCls}-tab-next-icon`}/>}
          </span>
      );
      // @ts-ignore
      return <Fragment>
        {prevButton}
        {nextButton}
      </Fragment>;
    };
    return {
      renderPrevNextBtn,
      updatedCal,
      setNextPrev,
      getOffsetWH,
      getScrollWH,
      getOffsetLT,
      setOffset,
      setPrev,
      setNext,
      isNextPrevShown,
      prevTransitionEnd,
      scrollToActiveTab,
      next, prev
    };
  },
  render(ctx) {
    const {next, prev} = this;
    const {prefixCls, scrollAnimated, navWrapper} = this.$props;
    const showNextPrev = prev || next;
    const navClassName = `${prefixCls}-nav`;
    const navClasses = {
      [navClassName]: true,
      [scrollAnimated ? `${navClassName}-animated` : `${navClassName}-no-animated`]: true
    };
    return (
        <div
            class={{
              [`${prefixCls}-nav-container`]: 1,
              [`${prefixCls}-nav-container-scrolling`]: showNextPrev
            }}
            key="container"
            ref={this.saveRef('container')}>
          {ctx.renderPrevNextBtn()}
          <div class={`${prefixCls}-nav-wrap`}
               ref={this.saveRef('navWrap')}>
            <div class={`${prefixCls}-nav-scroll`}>
              <div class={navClasses}
                   ref={this.saveRef('nav')}>
                {navWrapper(this.$slots.default())}
              </div>
            </div>
          </div>
        </div>
    );
  }
}) as any;
