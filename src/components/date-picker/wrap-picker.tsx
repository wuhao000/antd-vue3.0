import classNames from 'classnames';
import * as moment from 'moment';
import {getCurrentInstance, nextTick, onMounted, provide, ref, watch} from 'vue';
import interopDefault from '../_util/interopDefault';
import {getListeners, getOptionProps, initDefaultProps} from '../_util/props-util';
import warning from '../_util/warning';
import {useConfigProvider} from '../config-provider';
import {generateShowHourMinuteSecond} from '../time-picker';
import TimePickerPanel from '../vc-time-picker/panel';
import enUS from './locale/en_US';

function checkValidate(value, propName) {
  const values = Array.isArray(value) ? value : [value];
  values.forEach(val => {
    if (!val) return;

    warning(
      !interopDefault(moment).isMoment(val) || val.isValid(),
      'DatePicker',
      `\`${propName}\` provides invalidate moment time. If you want to set empty value, use \`null\` instead.`
    );
  });
}

const DEFAULT_FORMAT = {
  date: 'YYYY-MM-DD',
  dateTime: 'YYYY-MM-DD HH:mm:ss',
  week: 'gggg-wo',
  month: 'YYYY-MM'
};

const LOCALE_FORMAT_MAPPING = {
  date: 'dateFormat',
  dateTime: 'dateTimeFormat',
  week: 'weekFormat',
  month: 'monthFormat'
};

function getColumns({showHour, showMinute, showSecond, use12Hours}) {
  let column = 0;
  if (showHour) {
    column += 1;
  }
  if (showMinute) {
    column += 1;
  }
  if (showSecond) {
    column += 1;
  }
  if (use12Hours) {
    column += 1;
  }
  return column;
}

export default function wrapPicker(Picker, props, pickerType) {
  return {
    name: Picker.name,
    props: initDefaultProps(props, {
      transitionName: 'slide-up',
      popupStyle: {},
      locale: {}
    }),
    model: {
      prop: 'value',
      event: 'change'
    },
    setup(props, {emit}) {
      const popupRef = ref(undefined);
      const pickerRef = ref(undefined);
      watch(() => props.value, (val) => {
        checkValidate(val, 'value');
      });
      const savePopupRef = (ref) => {
        popupRef.value = ref;
      };
      const handleOpenChange = (open) => {
        emit('openChange', open);
      };
      const getDefaultLocale = () => {
        const result = {
          ...enUS,
          ...props.locale
        };
        result.lang = {
          ...result.lang,
          ...(props.locale || {}).lang
        };
        return result;
      };
      provide('savePopupRef', savePopupRef);
      onMounted(() => {
        const {autoFocus, disabled, value, defaultValue} = props;
        checkValidate(defaultValue, 'defaultValue');
        checkValidate(value, 'value');
        if (autoFocus && !disabled) {
          nextTick(() => {
            focus();
          });
        }
      });
      const handleFocus = (e) => {
        emit('focus', e);
      }
      const handleBlur = (e) => {
        emit('blur', e);
      }
      const handleMouseEnter = (e) => {
        emit('mouseenter', e);
      }
      const handleMouseLeave = (e) => {
        emit('mouseleave', e);
      }
      return {
        configProvider: useConfigProvider(),
        getDefaultLocale,
        handleFocus,
        handleBlur,
        handleMouseEnter,
        handleMouseLeave,
        focus() {
          pickerRef.value.focus();
        },
        blur() {
          pickerRef.value.blur();
        },
        renderPicker(locale, localeCode) {
          const props = getOptionProps(getCurrentInstance());
          const {
            prefixCls: customizePrefixCls,
            inputPrefixCls: customizeInputPrefixCls,
            getCalendarContainer,
            size,
            showTime,
            disabled,
            format
          } = props;
          const mergedPickerType = showTime ? `${pickerType}Time` : pickerType;
          const mergedFormat =
            format ||
            locale[LOCALE_FORMAT_MAPPING[mergedPickerType]] ||
            DEFAULT_FORMAT[mergedPickerType];

          const {getPrefixCls, getPopupContainer: getContextPopupContainer} = this.configProvider;
          const getPopupContainer = getCalendarContainer || getContextPopupContainer;
          const prefixCls = getPrefixCls('calendar', customizePrefixCls);
          const inputPrefixCls = getPrefixCls('input', customizeInputPrefixCls);

          const pickerClass = classNames(`${prefixCls}-picker`, {
            [`${prefixCls}-picker-${size}`]: !!size
          });
          const pickerInputClass = classNames(`${prefixCls}-picker-input`, inputPrefixCls, {
            [`${inputPrefixCls}-lg`]: size === 'large',
            [`${inputPrefixCls}-sm`]: size === 'small',
            [`${inputPrefixCls}-disabled`]: disabled
          });

          const timeFormat = (showTime && showTime.format) || 'HH:mm:ss';
          const vcTimePickerProps = {
            ...generateShowHourMinuteSecond(timeFormat),
            format: timeFormat,
            use12Hours: showTime && showTime.use12Hours
          };
          const columns = getColumns(vcTimePickerProps);
          const timePickerCls = `${prefixCls}-time-picker-column-${columns}`;
          const timePickerPanelProps = {
            props: {
              ...vcTimePickerProps,
              ...showTime,
              prefixCls: `${prefixCls}-time-picker`,
              placeholder: locale.timePickerLocale.placeholder,
              transitionName: 'slide-up'
            },
            class: timePickerCls,
            on: {
              esc: () => {
              }
            }
          };
          const timePicker = showTime ? <TimePickerPanel {...timePickerPanelProps} /> : null;
          const pickerProps = {
            ...props,
            getCalendarContainer: getPopupContainer,
            format: mergedFormat,
            pickerClass,
            pickerInputClass,
            locale,
            localeCode,
            timePicker,
            ...getListeners(this),
            onOpenChange: handleOpenChange,
            onFocus: handleFocus,
            onBlur: handleBlur,
            onMouseenter: handleMouseEnter,
            onMouseleave: handleMouseLeave,
            ref: 'picker'
          };
          return (
            <Picker {...pickerProps}>
              {this.$slots &&
              Object.keys(this.$slots).map(key => (
                <template slot={key} key={key}>
                  {this.$slots[key]}
                </template>
              ))}
            </Picker>
          );
        }
      };
    },
    render(ctx) {
      return ctx.renderPicker(ctx.getDefaultLocale());
      // return (
      //   <LocaleReceiver
      //     componentName="DatePicker"
      //     defaultLocale={this.getDefaultLocale}
      //     scopedSlots={{ default: this.renderPicker }}
      //   />
      // );
    }
  };
}
