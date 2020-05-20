import {useRootFocusBlur} from '@/tools/focus';
import {useLocalValue} from '@/tools/value';
import {App, defineComponent, getCurrentInstance, nextTick, onMounted} from 'vue';
import {getComponentFromProp, getListenersFromInstance, getListenersFromProps} from '../_util/props-util';
import PropTypes from '../_util/vue-types';
import Wave from '../_util/wave';
import Base from '../base';
import {useConfigProvider} from '../config-provider';
import Icon from '../icon';

const Switch = defineComponent({
  name: 'ASwitch',
  __ANT_SWITCH: true,
  model: {
    prop: 'checked',
    event: 'change'
  },
  props: {
    prefixCls: PropTypes.string,
    // size=default and size=large are the same
    size: PropTypes.oneOf(['small', 'default', 'large']),
    disabled: PropTypes.bool,
    checkedChildren: PropTypes.any,
    unCheckedChildren: PropTypes.any,
    tabIndex: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    value: PropTypes.bool,
    defaultChecked: PropTypes.bool,
    autoFocus: PropTypes.bool,
    loading: PropTypes.bool
  },
  setup(props, {emit}) {
    const configProvider = useConfigProvider();
    const {getValue, setValue} = useLocalValue(!!props.defaultChecked);
    const {focus, blur} = useRootFocusBlur();
    const setChecked = (checked, e) => {
      if (props.disabled) {
        return;
      }
      setValue(checked);
      emit('change', checked, e);
    };
    const handleClick = (e) => {
      const checked = !getValue();
      setChecked(checked, e);
      if (!props.disabled) {
        focus();
      }
      emit('click', checked, e);
    };
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        setChecked(false, e);
      } else if (e.key === 'ArrowRight') {
        setChecked(true, e);
      }
    };
    const handleMouseUp = (e) => {
      blur();
      emit('mouseup', e);
    };
    onMounted(() => {
      nextTick(() => {
        const {autoFocus, disabled} = props;
        if (autoFocus && !disabled) {
          focus();
        }
      });
    });
    return {
      focus, blur, configProvider, handleKeyDown, handleMouseUp, handleClick, getValue
    };
  },
  render(ctx) {
    const {prefixCls: customizePrefixCls, size, loading, disabled} = ctx;
    const getPrefixCls = ctx.configProvider.getPrefixCls;
    const prefixCls = getPrefixCls('switch', customizePrefixCls);
    const checked = ctx.getValue();
    const loadingIcon = loading ? (
        <Icon type="loading" class={`${prefixCls}-loading-icon`}/>
    ) : null;
    const switchClassName = {
      [prefixCls]: true,
      [`${prefixCls}-small`]: size === 'small',
      [`${prefixCls}-loading`]: loading,
      [`${prefixCls}-checked`]: checked,
      [`${prefixCls}-disabled`]: disabled
    };
    const instance = getCurrentInstance();
    const spanProps = {
      ...getListenersFromInstance(instance),
      onKeydown: ctx.handleKeyDown,
      onClick: ctx.handleClick,
      onMouseup: ctx.handleMouseUp,
      type: 'button',
      role: 'switch',
      'aria-checked': checked,
      disabled,
      tabIndex: ctx.tabIndex,
      class: switchClassName
    };
    return (
        <Wave insertExtraNode={true}>
          <button {...spanProps}>
            {loadingIcon}
            <span class={`${prefixCls}-inner`}>
              {checked
                  ? getComponentFromProp(instance, 'checkedChildren')
                  : getComponentFromProp(instance, 'unCheckedChildren')}
            </span>
          </button>
        </Wave>
    );
  }
}) as any;

/* istanbul ignore next */
Switch.install = function(app: App) {
  app.use(Base);
  app.component(Switch.name, Switch);
};

export default Switch;
