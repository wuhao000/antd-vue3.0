import {defineComponent, getCurrentInstance} from 'vue';
import {getComponentFromProp} from '../_util/props-util';
import PropTypes from '../_util/vue-types';

function noop() {
}

export default defineComponent({
  name: 'Star',
  props: {
    value: PropTypes.number,
    index: PropTypes.number,
    prefixCls: PropTypes.string,
    allowHalf: PropTypes.bool,
    disabled: PropTypes.bool,
    character: PropTypes.any,
    characterRender: PropTypes.func,
    focused: PropTypes.bool,
    count: PropTypes.number
  },
  setup(props, {emit}) {
    return {
      onHover(e) {
        emit('hover', e, props.index);
      },
      onClick(e) {
        emit('click', e, props.index);
      },
      onKeyDown(e) {
        if (e.keyCode === 13) {
          emit('click', e, props.index);
        }
      },
      getClassName() {
        const {prefixCls, index, value, allowHalf, focused} = props;
        const starValue = index + 1;
        let className = prefixCls;
        if (value === 0 && index === 0 && focused) {
          className += ` ${prefixCls}-focused`;
        } else if (allowHalf && value + 0.5 === starValue) {
          className += ` ${prefixCls}-half ${prefixCls}-active`;
          if (focused) {
            className += ` ${prefixCls}-focused`;
          }
        } else {
          className += starValue <= value ? ` ${prefixCls}-full` : ` ${prefixCls}-zero`;
          if (starValue === value && focused) {
            className += ` ${prefixCls}-focused`;
          }
        }
        return className;
      }
    };
  },
  render(ctx) {
    const {
      onHover,
      onClick,
      onKeyDown,
      disabled,
      prefixCls,
      characterRender,
      index,
      count,
      value
    } = ctx;
    const instance = getCurrentInstance();
    const character = getComponentFromProp(instance, 'character');
    let star = (
      <li class={ctx.getClassName()}>
        <div
          onClick={disabled ? noop : onClick}
          onKeydown={disabled ? noop : onKeyDown}
          onMousemove={disabled ? noop : onHover}
          role="radio"
          aria-checked={value > index ? 'true' : 'false'}
          aria-posinset={index + 1}
          aria-setsize={count}
          tabindex={0}>
          <div class={`${prefixCls}-first`}>{character}</div>
          <div class={`${prefixCls}-second`}>{character}</div>
        </div>
      </li>
    );
    if (characterRender) {
      star = characterRender(star, this.$props);
    }
    return star;
  }
}) as any;
