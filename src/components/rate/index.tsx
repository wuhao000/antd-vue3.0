import {useForm} from '@/components/form/src/form';
import {useRootFocusBlur} from '@/tools/focus';
import {useLocalValue} from '@/tools/value';
import classNames from 'classnames';
import {isVNode, defineComponent, getCurrentInstance, nextTick, onMounted, ref} from 'vue';
import KeyCode from '../_util/keycode';
import {getComponentFromProp} from '../_util/props-util';
import PropTypes from '../_util/vue-types';
import Base from '../base';
import {useConfigProvider} from '../config-provider';
import Icon from '../icon';
import Tooltip from '../tooltip';
import Star from './star';
import {getHTMLElement, getOffsetLeft} from './util';

function noop() {
}

export const RateProps = {
  prefixCls: PropTypes.string,
  count: PropTypes.number.def(5),
  value: PropTypes.number,
  defaultValue: PropTypes.number.def(0),
  allowHalf: PropTypes.bool.def(false),
  allowClear: PropTypes.bool.def(true),
  tooltips: PropTypes.arrayOf(PropTypes.string),
  disabled: PropTypes.bool,
  character: PropTypes.any.def('★'),
  autoFocus: PropTypes.bool,
  tabIndex: PropTypes.number.def(0)
};

const Rate = defineComponent({
  name: 'ARate',
  props: RateProps,
  setup(props, {emit}) {
    useForm().registerControl();
    const focused = ref(false);
    const hoverValue = ref(null);
    const cleanedValue = ref(null);
    const starRefs = ref([]);
    const characterRender = (node, {index}) => {
      if (!props.tooltips) {
        return node;
      }
      return <Tooltip title={props.tooltips[index]}>{node}</Tooltip>;
    };
    const onMouseLeave = () => {
      hoverValue.value = undefined;
      cleanedValue.value = null;
      emit('hoverChange', undefined);
    };
    const onFocus = () => {
      focused.value = true;
      emit('focus');
    };
    const onBlur = () => {
      focused.value = false;
      emit('blur');
    };
    const {setValue, getValue} = useLocalValue(props.defaultValue);
    const changeValue = (value) => {
      setValue(value);
      emit('change', value);
    };
    const onKeyDown = (event) => {
      const {keyCode} = event;
      const {count, allowHalf} = props;
      if (keyCode === KeyCode.RIGHT && getValue() < count) {
        if (allowHalf) {
          changeValue(getValue() + 0.5);
        } else {
          changeValue(getValue() + 1);
        }
        event.preventDefault();
      } else if (keyCode === KeyCode.LEFT && getValue() > 0) {
        if (allowHalf) {
          changeValue(getValue() - 0.5);
        } else {
          changeValue(getValue() - 1);
        }
        event.preventDefault();
      }
      emit('keydown', event);
    };
    const getStarValue = (index, x) => {
      let value = index + 1;
      if (props.allowHalf) {
        const starEle = getHTMLElement(starRefs.value[index]);


        const leftDis = getOffsetLeft(starEle);
        const width = starEle.clientWidth;
        if (x - leftDis < width / 2) {
          value -= 0.5;
        }
      }
      return value;
    };
    const onClick = (event, index) => {
      if (index !== undefined) {
        const {allowClear} = props;
        const newValue = getStarValue(index, event.pageX);
        let isReset = false;
        if (allowClear) {
          isReset = newValue === getValue();
        }
        onMouseLeave();
        changeValue(isReset ? 0 : newValue);
        cleanedValue.value = isReset ? newValue : null;
      }
    };
    const onHover = (event, index) => {
      const tmpHoverValue = getStarValue(index, event.pageX);
      if (tmpHoverValue !== cleanedValue.value) {
        cleanedValue.value = null;
        hoverValue.value = tmpHoverValue;
      }
      emit('hoverChange', tmpHoverValue);
    };
    onMounted(() => {
      nextTick(() => {
        if (props.autoFocus && !props.disabled) {
          focus();
        }
      });
    });
    const {blur, focus} = useRootFocusBlur();
    return {
      blur, focus,
      configProvider: useConfigProvider(),
      onMouseLeave,
      onFocus,
      onBlur,
      onClick,
      onKeyDown,
      onHover,
      setStarRef: (el, index) => {
        starRefs.value[index] = el;
      },
      characterRender,
      getValue,
      hoverValue,
      focused
    };
  },
  render(ctx) {
    const instance = getCurrentInstance();
    const {count, allowHalf, prefixCls: customizePrefixCls, tabIndex, disabled} = ctx;
    const getPrefixCls = ctx.configProvider.getPrefixCls;
    const prefixCls = getPrefixCls('rate', customizePrefixCls);

    const character = getComponentFromProp(instance, 'character') || (
      <Icon type="star" theme="filled"/>
    );
    const {hoverValue, focused} = ctx;
    const stars = [];
    const disabledClass = disabled ? `${prefixCls}-disabled` : '';
    const characterRender = ctx.characterRender;
    for (let index = 0; index < count; index++) {
      const starProps = {
        index,
        count,
        disabled,
        prefixCls: `${prefixCls}-star`,
        allowHalf,
        value: (hoverValue === undefined || hoverValue === null) ? ctx.getValue() : hoverValue,
        character,
        characterRender,
        focused,
        onClick: ctx.onClick,
        onHover: ctx.onHover,
        key: index,
        ref: (el) => {
          ctx.setStarRef(el, index);
        }
      };
      stars.push(<Star {...starProps} />);
    }


    return <ul
      class={classNames(prefixCls, disabledClass)}
      onMouseleave={disabled ? noop : ctx.onMouseLeave}
      tabindex={disabled ? -1 : tabIndex}
      onFocus={disabled ? noop : ctx.onFocus}
      onBlur={disabled ? noop : ctx.onBlur}
      onKeydown={disabled ? noop : ctx.onKeyDown}
      role="radiogroup">
      {stars}
    </ul>;
  }
}) as any;

/* istanbul ignore next */
Rate.install = function(Vue) {
  Vue.use(Base);
  Vue.component(Rate.name, Rate);
};
export default Rate;
