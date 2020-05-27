import classNames from 'classnames';
import {defineComponent} from 'vue';
import {cloneElement} from '../../_util/vnode';
import PropTypes from '../../_util/vue-types';

function noop() {
}

export default defineComponent({
  name: 'TabBarRootNode',
  inheritAttrs: false,
  props: {
    saveRef: PropTypes.func.def(noop),
    getRef: PropTypes.func.def(noop),
    prefixCls: PropTypes.string.def(''),
    tabBarPosition: PropTypes.string.def('top'),
    extraContent: PropTypes.any
  },
  setup(props, {emit}) {
    const onKeyDown = (e) => {
      emit('keydown', e);
    };
    return {
      onKeyDown
    };
  },
  render(ctx) {
    const {prefixCls, onKeyDown, tabBarPosition, extraContent} = ctx;
    const cls = classNames({
      [`${prefixCls}-bar`]: true
    }, ctx.$attrs.class);
    const topOrBottom = tabBarPosition === 'top' || tabBarPosition === 'bottom';
    const tabBarExtraContentStyle = topOrBottom ? {float: 'right'} : {};
    const children = this.$slots.default();
    let newChildren: any = children;
    if (extraContent) {
      newChildren = [
        cloneElement(extraContent, {
          key: 'extra',
          style: {
            ...tabBarExtraContentStyle
          }
        }),
        cloneElement(children, {key: 'content'})
      ];
      newChildren = topOrBottom ? newChildren : newChildren.reverse();
    }
    return (
        <div role="tablist"
             class={cls}
             tabindex={0}
             ref={this.saveRef('root')}
             onKeydown={onKeyDown}>
          {newChildren}
        </div>
    );
  }
}) as any;
