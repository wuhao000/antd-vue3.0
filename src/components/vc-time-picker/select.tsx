import classnames from 'classnames';
import raf from 'raf';
import {defineComponent, getCurrentInstance, nextTick, onMounted, ref, watch} from 'vue';
import PropTypes from '../_util/vue-types';

function noop() {
}

const scrollTo = (element, to, duration) => {
  // jump to target if duration zero
  if (duration <= 0) {
    raf(() => {
      element.scrollTop = to;
    });
    return;
  }
  const difference = to - element.scrollTop;
  const perTick = (difference / duration) * 10;

  raf(() => {
    element.scrollTop += perTick;
    if (element.scrollTop === to) {
      return;
    }
    scrollTo(element, to, duration - 10);
  });
};

const Select = defineComponent({
  props: {
    prefixCls: PropTypes.string,
    options: PropTypes.array,
    selectedIndex: PropTypes.number,
    type: PropTypes.string
    // onSelect: PropTypes.func,
    // onMouseEnter: PropTypes.func,
  },
  setup(props, {emit}) {
    const active = ref(false);
    const instance = getCurrentInstance();
    const listRef = ref(undefined);
    const onSelect = (value) => {
      const {type} = props;
      emit('select', type, value);
    };
    const onEsc = (e) => {
      emit('esc', e);
    };
    const getOptions = () => {
      const {options, selectedIndex, prefixCls} = props;
      return options.map((item, index) => {
        const cls = classnames({
          [`${prefixCls}-select-option-selected`]: selectedIndex === index,
          [`${prefixCls}-select-option-disabled`]: item.disabled
        });
        const onClick = item.disabled
            ? noop
            : () => {
              onSelect(item.value);
            };
        const onKeyDown = e => {
          if (e.key === 'Enter') {
            onClick();
          } else if (e.key === 'Escape') {
            onEsc(e);
          }
        };
        return (
            <li role="button"
                onClick={onClick}
                class={cls}
                key={index}
                tabindex={0}
                onKeydown={onKeyDown}>
              {item.value}
            </li>
        );
      });
    };

    const handleMouseEnter = (e) => {
      active.value = true;
      emit('mouseenter', e);
    };

    const handleMouseLeave = () => {
      active.value = false;
    };

    const scrollToSelected = (duration) => {
      // move to selected item
      const select = instance.vnode.el;
      const list = listRef.value;
      if (!list) {
        return;
      }
      let index = props.selectedIndex;
      if (index < 0) {
        index = 0;
      }
      const topOption = list.children[index];
      const to = topOption.offsetTop;
      scrollTo(select, to, duration);
    };
    onMounted(() => {
      nextTick(() => {
        // jump to selected option
        scrollToSelected(0);
      });
    });
    watch(() => props.selectedIndex, () => {
      nextTick(() => {
        // smooth scroll to selected option
        scrollToSelected(120);
      });
    });
    return {
      active, handleMouseLeave, getOptions, handleMouseEnter,
      setList: (el) => {
        listRef.value = el;
      }
    };
  },
  render(ctx) {
    const {prefixCls, options, active} = this;
    if (options.length === 0) {
      return null;
    }

    const cls = {
      [`${prefixCls}-select`]: 1,
      [`${prefixCls}-select-active`]: active
    };

    return (
        <div class={cls} onMouseenter={ctx.handleMouseEnter}
             onMouseleave={ctx.handleMouseLeave}>
          <ul ref={ctx.setList}>{ctx.getOptions()}</ul>
        </div>
    );
  }
}) as any;

export default Select;
