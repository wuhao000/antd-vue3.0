import {useLocalValue} from '@/tools/value';
import classNames from 'classnames';
import * as moment from 'moment';
import shallowequal from 'shallowequal';
import {CSSProperties, defineComponent, getCurrentInstance, nextTick, ref, watch} from 'vue';
import interopDefault from '../_util/interop-default';
import {
  getComponentFromContext,
  getComponentFromProp,
  getListenersFromInstance,
  getOptionProps,
  initDefaultProps,
  mergeProps
} from '../_util/props-util';
import {useConfigProvider} from '../config-provider';
import Icon from '../icon';
import Tag from '../tag';
import VcDatePicker from '../vc-calendar/src/picker';
import RangeCalendar from '../vc-calendar/src/range-calendar';
import InputIcon from './input-icon';
import {RangePickerProps} from './interface';
import { formatDate } from '../vc-calendar/src/util';

function noop() {
}

function getShowDateFromValue(value, mode?) {
  const [start, end] = value;
  // value could be an empty array, then we should not reset showDate
  if (!start && !end) {
    return;
  }
  if (mode && mode[0] === 'month') {
    return [start, end];
  }
  const newEnd = end && end.isSame(start, 'month') ? end.clone().add(1, 'month') : end;
  return [start, newEnd];
}

function pickerValueAdapter(value) {
  if (!value) {
    return;
  }
  if (Array.isArray(value)) {
    return value;
  }
  return [value, value.clone().add(1, 'month')];
}

function isEmptyArray(arr) {
  if (Array.isArray(arr)) {
    return arr.length === 0 || arr.every(i => !i);
  }
  return false;
}

function fixLocale(value, localeCode) {
  if (!localeCode) {
    return;
  }
  if (!value || value.length === 0) {
    return;
  }
  const [start, end] = value;
  if (start) {
    start.locale(localeCode);
  }
  if (end) {
    end.locale(localeCode);
  }
}

export default defineComponent({
  name: 'ARangePicker',
  props: initDefaultProps(RangePickerProps(), {
    allowClear: true,
    showToday: false,
    separator: '~'
  }),
  data() {

  },
  setup(props, {emit}) {
    const {value: sValue} = useLocalValue(props.defaultValue || []);
    const pickerValue = sValue.value || isEmptyArray(sValue.value) ? props.defaultPickerValue : sValue.value;
    const sShowDate = ref(pickerValueAdapter(pickerValue || interopDefault(moment)()));
    const sOpen = ref(props.open);
    const sHoverValue = ref([]);
    const pickerRef = ref(undefined);
    const _prefixCls = ref(undefined);
    const _tagPrefixCls = ref(undefined);
    watch(() => props.open, (val) => {
      sOpen.value = val;
    });
    watch(() => sOpen.value, (val, oldVal) => {
      nextTick(() => {
        if (props.open === undefined && oldVal && !val) {
          focus();
        }
      });
    });
    watch(() => props.value, (val) => {
      const value = val || [];
      if (!shallowequal(val, sValue.value)) {
        sShowDate.value = getShowDateFromValue(value, props.mode) || sShowDate.value;
      }
      sValue.value = value;
    });
    const setValue = (value, hidePanel) => {
      handleChange(value);
      if ((hidePanel || !props.showTime) && props.open === undefined) {
        sOpen.value = false;
      }
    };
    const clearSelection = (e) => {
      e.preventDefault();
      e.stopPropagation();
      sValue.value = [];
      handleChange([]);
    };
    const clearHoverValue = () => {
      sHoverValue.value = [];
    };
    const handleChange = (value) => {
      if (props.value === undefined) {
        sValue.value = value;
        sShowDate.value = getShowDateFromValue(value) || sShowDate.value;
      }
      if (value[0] && value[1] && value[0].diff(value[1]) > 0) {
        value[1] = undefined;
      }
      const [start, end] = value;
      emit('change', value, [formatDate(start, props.format), formatDate(end, props.format)]);
    };
    const handleOpenChange = (open) => {
      if (props.open === undefined) {
        sOpen.value = open;
      }

      if (open === false) {
        clearHoverValue();
      }
      emit('openChange', open);
    };
    const handleShowDateChange = (showDate) => {
      sShowDate.value = showDate;
    };
    const handleHoverChange = (hoverValue) => {
      sHoverValue.value = hoverValue;
    };
    const handleRangeMouseLeave = () => {
      if (sOpen.value) {
        clearHoverValue();
      }
    };
    const handleCalendarInputSelect = (value) => {
      const [start] = value;
      if (!start) {
        return;
      }
      sValue.value = value;
      sShowDate.value = getShowDateFromValue(value) || sShowDate.value;
    };
    const handleRangeClick = (value) => {
      let copyValue: any = value;
      if (typeof value === 'function') {
        copyValue = value();
      }
      setValue(copyValue, true);
      emit('ok', copyValue);
      emit('openChange', false);
    };
    const onMouseEnter = (e) => {
      emit('mouseenter', e);
    };
    const onMouseLeave = (e) => {
      emit('mouseleave', e);
    };
    const focus = () => {
      pickerRef.value.focus();
    };
    const blur = () => {
      pickerRef.value.blur();
    };
    const currentInstance = getCurrentInstance();
    const renderFooter = () => {
      const ranges = props.ranges;
      const prefixCls = _prefixCls.value;
      const tagPrefixCls = _tagPrefixCls.value;
      const renderExtraFooter = getComponentFromProp(currentInstance, 'renderExtraFooter');
      if (!ranges && !renderExtraFooter) {
        return null;
      }
      const customFooter = renderExtraFooter ? (
          <div class={`${prefixCls}-footer-extra`} key="extra">
            {typeof renderExtraFooter === 'function' ? renderExtraFooter() : renderExtraFooter}
          </div>
      ) : null;
      const operations =
          ranges &&
          Object.keys(ranges).map(range => {
            const value = ranges[range];
            const hoverValue = typeof value === 'function' ? value.call(this) : value;
            return (
                <Tag key={range}
                     prefixCls={tagPrefixCls}
                     color="blue"
                     onClick={() => handleRangeClick(value)}
                     onMouseenter={() => sHoverValue.value = hoverValue}
                     onMouseleave={handleRangeMouseLeave}>
                  {range}
                </Tag>
            );
          });
      const rangeNode =
          operations && operations.length > 0 ? (
              <div class={`${prefixCls}-footer-extra ${prefixCls}-range-quick-selector`} key="range">
                {operations}
              </div>
          ) : null;
      return [rangeNode, customFooter];
    };
    return {
      sValue,
      sOpen,
      sHoverValue,
      sShowDate,
      setValue,
      clearSelection,
      clearHoverValue,
      handleChange,
      handleOpenChange,
      handleShowDateChange,
      handleHoverChange,
      handleRangeMouseLeave,
      handleCalendarInputSelect,
      handleRangeClick,
      onMouseEnter,
      onMouseLeave,
      focus,
      blur,
      renderFooter,
      setPrefixCls(prefixCls) {
        _prefixCls.value = prefixCls;
      },
      setTagPrefixCls(prefixCls) {
        _tagPrefixCls.value = prefixCls;
      },
      setPickerRef(el) {
        pickerRef.value = el;
      }
    };
  },
  render(ctx) {
    const instance = getCurrentInstance();
    const props = getOptionProps(instance);
    let suffixIcon = getComponentFromContext(this, 'suffixIcon');
    suffixIcon = Array.isArray(suffixIcon) ? suffixIcon[0] : suffixIcon;
    const {
      sValue: value,
      sShowDate: showDate,
      sHoverValue: hoverValue,
      sOpen: open
    } = ctx;
    const listeners = getListenersFromInstance(instance);
    const {
      onCalendarChange = noop,
      onOk = noop,
      onFocus = noop,
      onBlur = noop,
      onPanelChange = noop
    } = listeners;
    const {
      prefixCls: customizePrefixCls,
      tagPrefixCls: customizeTagPrefixCls,
      popupStyle,
      disabledDate,
      disabledTime,
      showTime,
      showToday,
      ranges,
      locale,
      localeCode,
      format,
      separator
    } = props;
    const configProvider = useConfigProvider();
    const getPrefixCls = configProvider.getPrefixCls;
    const prefixCls = getPrefixCls('calendar', customizePrefixCls);
    const tagPrefixCls = getPrefixCls('tag', customizeTagPrefixCls);
    ctx.setPrefixCls(prefixCls);
    ctx.setTagPrefixCls(tagPrefixCls);

    const dateRender = getComponentFromProp(instance, 'dateRender');
    fixLocale(value, localeCode);
    fixLocale(showDate, localeCode);

    const calendarClassName = classNames({
      [`${prefixCls}-time`]: showTime,
      [`${prefixCls}-range-with-ranges`]: ranges
    });

    // 需要选择时间时，点击 ok 时才触发 onChange
    const pickerChangeHandler = {
      onChange: ctx.handleChange
    };
    let calendarProps: any = {
      onOk: this.handleChange
    };
    if (props.timePicker) {
      pickerChangeHandler.onChange = changedValue => this.handleChange(changedValue);
    } else {
      calendarProps = {};
    }
    if ('mode' in props) {
      calendarProps.mode = props.mode;
    }

    const startPlaceholder = Array.isArray(props.placeholder)
        ? props.placeholder[0]
        : locale.lang.rangePlaceholder[0];
    const endPlaceholder = Array.isArray(props.placeholder)
        ? props.placeholder[1]
        : locale.lang.rangePlaceholder[1];

    const rangeCalendarProps = mergeProps(calendarProps, {
      separator,
      format,
      prefixCls,
      renderFooter: this.renderFooter,
      timePicker: props.timePicker,
      disabledDate,
      disabledTime,
      dateInputPlaceholder: [startPlaceholder, endPlaceholder],
      locale: locale.lang,
      dateRender,
      value: showDate,
      hoverValue,
      showToday,
      onChange: onCalendarChange,
      onOk,
      onValueChange: this.handleShowDateChange,
      onHoverChange: this.handleHoverChange,
      onPanelChange,
      onInputSelect: this.handleCalendarInputSelect,
      class: calendarClassName
    });
    const calendar = <RangeCalendar {...rangeCalendarProps} />;

    // default width for showTime
    const pickerStyle: CSSProperties = {};
    if (props.showTime) {
      pickerStyle.width = '350px';
    }
    const [startValue, endValue] = value;
    const clearIcon =
        !props.disabled && props.allowClear && value && (startValue || endValue) ? (
            <Icon
                type="close-circle"
                class={`${prefixCls}-picker-clear`}
                onClick={this.clearSelection}
                theme="filled"
            />
        ) : null;

    const inputIcon = <InputIcon suffixIcon={suffixIcon} prefixCls={prefixCls}/>;

    const input = ({value: inputValue}) => {
      const [start, end] = inputValue;
      return (
          <span class={props.pickerInputClass}>
          <input
              disabled={props.disabled}
              readonly={true}
              value={formatDate(start, props.format)}
              placeholder={startPlaceholder}
              class={`${prefixCls}-range-picker-input`}
              tabindex={-1}
          />
          <span class={`${prefixCls}-range-picker-separator`}> {separator} </span>
          <input
              disabled={props.disabled}
              readonly={true}
              value={formatDate(end, props.format)}
              placeholder={endPlaceholder}
              class={`${prefixCls}-range-picker-input`}
              tabindex={-1}
          />
            {clearIcon}
            {inputIcon}
        </span>
      );
    };
    const vcDatePickerProps = mergeProps(
        {
          ...props,
          ...listeners
        },
        pickerChangeHandler,
        {
          calendar,
          value,
          open,
          prefixCls: `${prefixCls}-picker-container`,
          onOpenChange: this.handleOpenChange,
          style: popupStyle
        }
    );
    return (
        <span
            ref={ctx.setPickerRef}
            class={props.pickerClass}
            style={pickerStyle}
            tabindex={props.disabled ? -1 : 0}
            onFocus={focus}
            onBlur={blur}
            onMouseenter={this.onMouseEnter}
            onMouseleave={this.onMouseLeave}
        >
        <VcDatePicker slots={
          {
            ...this.$slots,
            default: input
          }
        } {...vcDatePickerProps}>
        </VcDatePicker>
      </span>
    );
  }
});
