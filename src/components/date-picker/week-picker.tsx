import {useLocalValue} from '@/tools/value';
import {getCurrentInstance, nextTick, onUpdated, ref} from 'vue';
import {
  getComponentFromProp,
  getListenersFromInstance,
  getOptionProps,
  hasProp,
  initDefaultProps
} from '../_util/props-util';
import {useConfigProvider} from '../config-provider';
import Icon from '../icon';
import Calendar from '../vc-calendar';
import VcDatePicker from '../vc-calendar/src/picker';
import InputIcon from './input-icon';
import {WeekPickerProps} from './interface';

function formatValue(value, format) {
  return (value && value.format(format)) || '';
}

function noop() {
}

export default {
  // static defaultProps = {
  //   format: 'YYYY-wo',
  //   allowClear: true,
  // };

  // private input: any;
  name: 'AWeekPicker',
  props: initDefaultProps(WeekPickerProps(), {
    format: 'gggg-wo',
    allowClear: true
  }),
  setup(props, {emit}) {
    const currentInstance = getCurrentInstance();
    const {value: _value, setValue, context: valueContext} = useLocalValue(props.defaultValue);
    const {value: _open, setValue: setOpen, context: openContext} = useLocalValue(props.defaultOpen, 'open');
    const prevState = ref({_value: _value.value, _open: _open.value});
    valueContext.doAfterSetValue = (value) => {
      prevState.value = {_value: value, _open: _open.value};
    };
    openContext.doAfterSetValue = (value) => {
      prevState.value = {_open: value, _value: _value.value};
      nextTick(() => {
        if (!_open.value) {
          focus();
        }
      });
    };
    const handleChange = (value) => {
      setValue(value);
      emit('change', value, formatValue(value, props.format));
    }
    const _prefixCls = ref(null)
    const setPrefixCls = (prefix) => {
      _prefixCls.value = prefix;
    }
    const inputRef = ref(undefined);
    const focus = () => {
      inputRef.value.focus();
    }
    const blur = () => {
      inputRef.value.blur();
    }
    onUpdated(() => {
      nextTick(() => {
        if (!_open.value && prevState.value._open) {
          focus();
        }
      });
    });
    return {
      setPrefixCls,
      _value,
      _open,
      focus,
      blur,
      configProvider: useConfigProvider(),
      weekDateRender(current) {
        const selectedValue = _value.value;
        const prefixCls = _prefixCls.value
        const dateRender = getComponentFromProp(currentInstance, 'dateRender');
        const dateNode = dateRender ? dateRender(current) : current.date();
        if (
            selectedValue &&
            current.year() === selectedValue.year() &&
            current.week() === selectedValue.week()
        ) {
          return (
              <div class={`${prefixCls}-selected-day`}>
                <div class={`${prefixCls}-date`}>{dateNode}</div>
              </div>
          );
        }
        return <div class={`${prefixCls}-date`}>{dateNode}</div>;
      },
      handleChange,
      handleOpenChange(open) {
        setOpen(open);
        emit('openChange', open);
      },
      clearSelection(e) {
        e.preventDefault();
        e.stopPropagation();
        handleChange(null);
      },
      renderFooter(...args) {
        const prefixCls = _prefixCls.value;
        const renderExtraFooter = getComponentFromProp(getCurrentInstance(), 'renderExtraFooter');
        return renderExtraFooter ? (
            <div class={`${prefixCls}-footer-extra`}>{renderExtraFooter(...args)}</div>
        ) : null;
      }
    };
  },

  render(ctx) {
    const instance = getCurrentInstance();
    const props = getOptionProps(instance);
    let suffixIcon = getComponentFromProp(instance, 'suffixIcon');
    suffixIcon = Array.isArray(suffixIcon) ? suffixIcon[0] : suffixIcon;
    const {
      prefixCls: customizePrefixCls,
      disabled,
      pickerClass,
      popupStyle,
      pickerInputClass,
      format,
      allowClear,
      locale,
      localeCode,
      disabledDate,
      defaultPickerValue,
      $scopedSlots
    } = props;
    const listeners = getListenersFromInstance(instance);
    const getPrefixCls = useConfigProvider().getPrefixCls;
    const prefixCls = getPrefixCls('calendar', customizePrefixCls);
    ctx.setPrefixCls(prefixCls);

    const {_value: pickerValue, _open: open} = ctx;
    const {focus = noop, blur = noop} = listeners;

    if (pickerValue && localeCode) {
      pickerValue.locale(localeCode);
    }
    const placeholder = hasProp(instance, 'placeholder') ? props.placeholder : locale.lang.placeholder;
    const weekDateRender = getComponentFromProp(instance, 'weekDateRender');
    const calendar = (
        <Calendar
            showWeekNumber={true}
            dateRender={weekDateRender}
            prefixCls={prefixCls}
            format={format}
            locale={locale.lang}
            showDateInput={false}
            showToday={false}
            disabledDate={disabledDate}
            renderFooter={ctx.renderFooter}
            defaultValue={defaultPickerValue}
        />
    );
    const clearIcon =
        !disabled && allowClear && ctx._value ? (
            <Icon
                type="close-circle"
                class={`${prefixCls}-picker-clear`}
                onClick={ctx.clearSelection}
                theme="filled"
            />
        ) : null;

    const inputIcon = <InputIcon suffixIcon={suffixIcon} prefixCls={prefixCls}/>;

    const input = ({value}) => {
      return (
          <span style={{display: 'inline-block', width: '100%'}}>
            <input
                ref="input"
                disabled={disabled}
                readonly={true}
                value={(value && value.format(format)) || ''}
                placeholder={placeholder}
                class={pickerInputClass}
                onFocus={focus}
                onBlur={blur}
            />
            {clearIcon}
            {inputIcon}
          </span>
      );
    };
    const vcDatePickerProps = {
      ...props,
      calendar,
      prefixCls: `${prefixCls}-picker-container`,
      value: pickerValue,
      open,
      ...listeners,
      onChange: this.handleChange,
      onOpenChange: this.handleOpenChange,
      style: popupStyle
    };
    return (
        <span class={pickerClass}>
          <VcDatePicker slots={{
            ...this.$slots,
            default: input
          }} {...vcDatePickerProps} />
        </span>
    );
  }
};
