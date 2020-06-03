import {useLocalValue} from '@/tools/value';
import * as moment from 'moment';
import omit from 'omit.js';
import {defineComponent, getCurrentInstance, ref} from 'vue';
import {
  getComponentFromContext,
  getComponentFromProp,
  getListenersFromInstance,
  initDefaultProps,
  isValidElement
} from '../_util/props-util';
import {cloneElement} from '../_util/vnode';
import PropTypes from '../_util/vue-types';
import Base from '../base';
import {useConfigProvider} from '../config-provider';
import Icon from '../icon';
import LocaleReceiver from '../locale-provider/locale-receiver';
import VcTimePicker from '../vc-time-picker';
import enUS from './locale/zh_CN';

export function generateShowHourMinuteSecond(format) {
  // Ref: http://momentjs.com/docs/#/parsing/string-format/
  return {
    showHour: format.indexOf('H') > -1 || format.indexOf('h') > -1 || format.indexOf('k') > -1,
    showMinute: format.indexOf('m') > -1,
    showSecond: format.indexOf('s') > -1
  };
}

function isMoment(value) {
  if (Array.isArray(value)) {
    return (
        value.length === 0 || value.findIndex(val => val === undefined || moment.isMoment(val)) !== -1
    );
  } else {
    return value === undefined || moment.isMoment(value);
  }
}

const MomentType = PropTypes.custom(isMoment);
export const TimePickerProps = () => ({
  size: PropTypes.oneOf(['large', 'default', 'small']),
  value: MomentType,
  defaultValue: MomentType,
  open: PropTypes.bool,
  format: PropTypes.string,
  disabled: PropTypes.bool,
  placeholder: PropTypes.string,
  prefixCls: PropTypes.string,
  hideDisabledOptions: PropTypes.bool,
  disabledHours: PropTypes.func,
  disabledMinutes: PropTypes.func,
  disabledSeconds: PropTypes.func,
  getPopupContainer: PropTypes.func,
  use12Hours: PropTypes.bool,
  focusOnOpen: PropTypes.bool,
  hourStep: PropTypes.number,
  minuteStep: PropTypes.number,
  secondStep: PropTypes.number,
  allowEmpty: PropTypes.bool,
  allowClear: PropTypes.bool,
  inputReadOnly: PropTypes.bool,
  clearText: PropTypes.string,
  defaultOpenValue: PropTypes.object,
  popupClassName: PropTypes.string,
  popupStyle: PropTypes.object,
  suffixIcon: PropTypes.any,
  align: PropTypes.object,
  placement: PropTypes.any,
  transitionName: PropTypes.string,
  autoFocus: PropTypes.bool,
  addon: PropTypes.any,
  clearIcon: PropTypes.any,
  locale: PropTypes.object
});

const TimePicker = defineComponent({
  name: 'ATimePicker',
  props: initDefaultProps(TimePickerProps(), {
    align: {
      offset: [0, -2]
    },
    disabled: false,
    disabledHours: undefined,
    disabledMinutes: undefined,
    disabledSeconds: undefined,
    hideDisabledOptions: false,
    placement: 'bottomLeft',
    transitionName: 'slide-up',
    focusOnOpen: true,
    allowClear: true
  }),
  provide() {
    return {
      savePopupRef: this.savePopupRef
    };
  },
  setup(props, {emit, slots}) {
    const instance = getCurrentInstance();
    const configProvider = useConfigProvider();
    const {value, setValue} = useLocalValue(props.defaultValue);
    const popupRef = ref(undefined);
    const timePickerRef = ref(undefined);
    const getDefaultFormat = () => {
      const {format, use12Hours} = props;
      if (format) {
        return format;
      } else if (use12Hours) {
        return 'h:mm:ss a';
      }
      return 'HH:mm:ss';
    };
    const getAllowClear = () => {
      const {allowClear, allowEmpty} = props;
      if (props.allowClear !== undefined) {
        return allowClear;
      }
      return allowEmpty;
    };
    const getDefaultLocale = () => {
      return {
        ...enUS,
        ...props.locale
      };
    };
    const handleChange = (v) => {
      setValue(v);
      const {format = 'HH:mm:ss'} = props;
      emit('change', v, (v && v.format(format)) || '');
    };
    const handleOpenClose = ({open}) => {
      emit('openChange', open);
      emit('update:open', open);
    };
    const setTimePicker = (el) => {
      timePickerRef.value = el;
    };
    const focus = () => {
      timePickerRef.value.focus();
    };
    const blur = () => {
      timePickerRef.value.blur();
    };
    const renderInputIcon = (prefixCls) => {
      let suffixIcon = getComponentFromContext({$props: props, $slots: slots}, 'suffixIcon');
      suffixIcon = Array.isArray(suffixIcon) ? suffixIcon[0] : suffixIcon;
      const clockIcon = (suffixIcon &&
          isValidElement(suffixIcon) &&
          cloneElement(suffixIcon, {
            class: `${prefixCls}-clock-icon`
          })) || <Icon type="clock-circle" class={`${prefixCls}-clock-icon`}/>;

      return <span class={`${prefixCls}-icon`}>{clockIcon}</span>;
    };
    const renderClearIcon = (prefixCls) => {
      const clearIcon = getComponentFromProp(instance, 'clearIcon');
      const clearIconPrefixCls = `${prefixCls}-clear`;

      if (clearIcon && isValidElement(clearIcon)) {
        return cloneElement(clearIcon, {
          class: clearIconPrefixCls
        });
      }

      return <Icon type="close-circle" class={clearIconPrefixCls} theme="filled"/>;
    };
    return {
      value,
      focus,
      blur,
      getDefaultLocale,
      savePopupRef(el) {
        popupRef.value = el;
      },
      renderTimePicker(locale) {
        const ommitedProps = omit(props, ['defaultValue', 'suffixIcon', 'allowEmpty', 'allowClear']);
        const {prefixCls: customizePrefixCls, getPopupContainer, placeholder, size} = ommitedProps;
        const getPrefixCls = configProvider.getPrefixCls;
        const prefixCls = getPrefixCls('time-picker', customizePrefixCls);

        const format = getDefaultFormat();
        const pickerClassName = {
          [`${prefixCls}-${size}`]: !!size
        };
        const tempAddon = getComponentFromProp(instance, 'addon', {}, false);
        const pickerAddon = panel => {
          return tempAddon ? (
              <div class={`${prefixCls}-panel-addon`}>
                {typeof tempAddon === 'function' ? tempAddon(panel) : tempAddon}
              </div>
          ) : null;
        };
        const inputIcon = renderInputIcon(prefixCls);
        const clearIcon = renderClearIcon(prefixCls);
        const {getPopupContainer: getContextPopupContainer} = configProvider;
        const timeProps = {
          ...generateShowHourMinuteSecond(format),
          ...ommitedProps,
          allowEmpty: getAllowClear(),
          prefixCls,
          getPopupContainer: getPopupContainer || getContextPopupContainer,
          format,
          value: value.value,
          placeholder: placeholder === undefined ? locale.placeholder : placeholder,
          addon: pickerAddon,
          inputIcon,
          clearIcon,
          class: pickerClassName,
          ref: setTimePicker,
          ...getListenersFromInstance(getCurrentInstance()),
          onChange: handleChange,
          onOpen: handleOpenClose,
          onClose: handleOpenClose
        };
        return <VcTimePicker {...timeProps} />;
      }
    };
  },
  render(ctx) {
    return (
        <LocaleReceiver
            componentName="TimePicker"
            defaultLocale={ctx.getDefaultLocale()}
            slots={{default: ctx.renderTimePicker}}
        />
    );
  }
}) as any;

/* istanbul ignore next */
TimePicker.install = function(Vue) {
  Vue.use(Base);
  Vue.component(TimePicker.name, TimePicker);
};

export default TimePicker;
