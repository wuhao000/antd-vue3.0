import {useLocalValue} from '@/tools/value';
import omit from 'omit.js';
import {defineComponent, Transition, getCurrentInstance} from 'vue';
import getTransitionProps from '../_util/getTransitionProps';
import {getListenersFromInstance} from '../_util/props-util';
import PropTypes from '../_util/vue-types';
import Wave from '../_util/wave';
import {useConfigProvider} from '../config-provider';
import Icon from '../icon';

const PresetColorTypes = [
  'pink',
  'red',
  'yellow',
  'orange',
  'cyan',
  'green',
  'blue',
  'purple',
  'geekblue',
  'magenta',
  'volcano',
  'gold',
  'lime'
];
const PresetColorRegex = new RegExp(`^(${PresetColorTypes.join('|')})(-inverse)?$`);

export default defineComponent({
  name: 'ATag',
  props: {
    prefixCls: PropTypes.string,
    color: PropTypes.string,
    closable: PropTypes.bool.def(false),
    visible: PropTypes.bool,
    afterClose: PropTypes.func
  },
  setup(props, {emit}) {
    const {value: _visible, setValue: setLocalVisible} = useLocalValue(true, 'visible');
    const setVisible = (visible, e) => {
      emit('close', e);
      emit('close.visible', false);
      const afterClose = props.afterClose;
      if (afterClose) {
        // next version remove.
        afterClose();
      }
      if (e.defaultPrevented) {
        return;
      }
      setLocalVisible(visible);
    };
    const handleIconClick = (e) => {
      e.stopPropagation();
      setVisible(false, e);
    };
    const isPresetColor = () => {
      const {color} = props;
      if (!color) {
        return false;
      }
      return PresetColorRegex.test(color);
    };
    const getTagStyle = () => {
      const {color} = props;
      return {
        backgroundColor: color && !isPresetColor() ? color : undefined
      };
    };
    const getTagClassName = (prefixCls) => {
      const {color} = props;
      return {
        [prefixCls]: true,
        [`${prefixCls}-${color}`]: isPresetColor(),
        [`${prefixCls}-has-color`]: color && !isPresetColor()
      };
    };
    const renderCloseIcon = () => {
      const {closable} = props;
      return closable ? <Icon type="close" onClick={handleIconClick}/> : null;
    };
    return {
      _visible,
      setVisible,
      handleIconClick,
      isPresetColor,
      getTagStyle,
      getTagClassName,
      renderCloseIcon,
      configProvider: useConfigProvider()
    };
  },
  render(ctx) {
    const instance = getCurrentInstance();
    const customizePrefixCls = ctx.prefixCls;
    const getPrefixCls = ctx.configProvider.getPrefixCls;
    const prefixCls = getPrefixCls('tag', customizePrefixCls);
    const visible = ctx._visible;
    const tag = (
        <span
            v-show={visible}
            {...omit(getListenersFromInstance(instance), ['close'])}
            class={ctx.getTagClassName(prefixCls)}
            style={ctx.getTagStyle()}>
        {this.$slots.default && this.$slots.default()}
          {ctx.renderCloseIcon()}
      </span>
    );
    const transitionProps = getTransitionProps(`${prefixCls}-zoom`, {
      appear: false
    });
    return (
        <Wave>
          <Transition {...transitionProps}>{tag}</Transition>
        </Wave>
    );
  }
}) as any;
