import {useLocalValue} from '@/tools/value';
import moment from 'moment';
import {defineComponent, getCurrentInstance, ref, watch} from 'vue';
import KeyCode from '../../_util/KeyCode';
import {getComponentFromProp, getListenersFromInstance, getOptionProps, mergeProps} from '../../_util/props-util';
import PropTypes from '../../_util/vue-types';
import OkButton from './calendar/ok-button';
import TimePickerButton from './calendar/time-picker-button';
import TodayButton from './calendar/today-button';
import enUs from './locale/zh_CN';
import {useCommonMixin} from './mixin/common-mixin';
import CalendarPart from './range-calendar/calendar-part';
import {getTodayTime, isAllowedDate, syncTime} from './util/';
import {goEndMonth, goStartMonth, goTime, includesTime} from './util/toTime';

function noop() {
}

function isEmptyArray(arr) {
  return Array.isArray(arr) && (arr.length === 0 || arr.every(i => !i));
}

function isArraysEqual(a, b) {
  if (a === b) {
    return true;
  }
  if (a === null || typeof a === 'undefined' || b === null || typeof b === 'undefined') {
    return false;
  }
  if (a.length !== b.length) {
    return false;
  }

  for (let i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}

function getValueFromSelectedValue(selectedValue) {
  let [start, end] = selectedValue;
  if (end && (start === undefined || start === null)) {
    start = end.clone().subtract(1, 'month');
  }

  if (start && (end === undefined || end === null)) {
    end = start.clone().add(1, 'month');
  }
  return [start, end];
}

function normalizeAnchor(props, init) {
  const selectedValue = props.selectedValue || (init && props.defaultSelectedValue);
  const value = props.value || (init && props.defaultValue);
  const normalizedValue = value
      ? getValueFromSelectedValue(value)
      : getValueFromSelectedValue(selectedValue);
  return !isEmptyArray(normalizedValue)
      ? normalizedValue
      : init && [moment(), moment().add(1, 'months')];
}

function generateOptions(length, extraOptionGen) {
  const arr = extraOptionGen ? extraOptionGen().concat() : [];
  for (let value = 0; value < length; value++) {
    if (arr.indexOf(value) === -1) {
      arr.push(value);
    }
  }
  return arr;
}

const RangeCalendar = defineComponent({
  props: {
    locale: PropTypes.object.def(enUs),
    visible: PropTypes.bool.def(true),
    prefixCls: PropTypes.string.def('rc-calendar'),
    dateInputPlaceholder: PropTypes.any,
    seperator: PropTypes.string.def('~'),
    defaultValue: PropTypes.any,
    value: PropTypes.any,
    hoverValue: PropTypes.any,
    mode: PropTypes.arrayOf(PropTypes.oneOf(['time', 'date', 'month', 'year', 'decade'])),
    showDateInput: PropTypes.bool.def(true),
    timePicker: PropTypes.any,
    showOk: PropTypes.bool,
    showToday: PropTypes.bool.def(true),
    defaultSelectedValue: PropTypes.array.def([]),
    selectedValue: PropTypes.array,
    showClear: PropTypes.bool,
    showWeekNumber: PropTypes.bool,
    // locale: PropTypes.object,
    // onChange: PropTypes.func,
    // onSelect: PropTypes.func,
    // onValueChange: PropTypes.func,
    // onHoverChange: PropTypes.func,
    // onPanelChange: PropTypes.func,
    format: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
    // onClear: PropTypes.func,
    type: PropTypes.any.def('both'),
    disabledDate: PropTypes.func,
    disabledTime: PropTypes.func.def(() => () => noop),
    renderFooter: PropTypes.func.def(() => () => null),
    renderSidebar: PropTypes.func.def(() => () => null),
    dateRender: PropTypes.func,
    clearIcon: PropTypes.any
  },
  setup(props, {emit}) {
    const {value: sSelectedValue} = useLocalValue(props.defaultSelectedValue, 'selectedValue');
    const prevSelectedValue = ref(sSelectedValue.value);
    const firstSelectedValue = ref(null);
    const sHoverValue = ref(props.hoverValue || []);
    const sValue = ref(normalizeAnchor(props, 1));
    const sShowTimePicker = ref(false);
    const sPanelTriggerSource = ref('');
    const {value: sMode} = useLocalValue(['date', 'date'], 'mode');
    const {getFormat} = useCommonMixin(props);
    const hasSelectedValue = () => {
      return !!sSelectedValue.value[1] && !!sSelectedValue.value[0];
    };
    const compare = (v1, v2) => {
      if (props.timePicker) {
        return v1.diff(v2);
      }
      return v1.diff(v2, 'days');
    };
    const fireHoverValueChange = (hoverValue) => {
      if (props.hoverValue === undefined) {
        sHoverValue.value = hoverValue;
      }
      emit('hoverChange', hoverValue);
    };
    const onSelect = (value) => {
      const type = props.type;

      let nextSelectedValue;
      if (type === 'both') {
        if (!firstSelectedValue.value) {
          syncTime(prevSelectedValue.value[0], value);
          nextSelectedValue = [value];
        } else if (compare(firstSelectedValue.value, value) < 0) {
          syncTime(prevSelectedValue.value[1], value);
          nextSelectedValue = [firstSelectedValue.value, value];
        } else {
          syncTime(prevSelectedValue.value[0], value);
          syncTime(prevSelectedValue.value[1], firstSelectedValue.value);
          nextSelectedValue = [value, firstSelectedValue.value];
        }
      } else if (type === 'start') {
        syncTime(prevSelectedValue.value[0], value);
        const endValue = sSelectedValue.value[1];
        nextSelectedValue =
            endValue && compare(endValue, value) > 0 ? [value, endValue] : [value];
      } else {
        // type === 'end'
        const startValue = sSelectedValue.value[0];
        if (startValue && compare(startValue, value) <= 0) {
          syncTime(prevSelectedValue.value[1], value);
          nextSelectedValue = [startValue, value];
        } else {
          syncTime(prevSelectedValue.value[0], value);
          nextSelectedValue = [value];
        }
      }
      fireSelectValueChange(nextSelectedValue);
    };
    const getStartValue = () => {
      const selectedValue = sSelectedValue.value;
      const showTimePicker = sShowTimePicker.value;
      const value = sValue.value;
      const mode = sMode.value;
      const panelTriggerSource = sPanelTriggerSource.value;
      let startValue = value[0];
      // keep selectedTime when select date
      if (selectedValue[0] && props.timePicker) {
        startValue = startValue.clone();
        syncTime(selectedValue[0], startValue);
      }
      if (showTimePicker && selectedValue[0]) {
        startValue = selectedValue[0];
      }

      // Adjust month if date not align
      if (
          panelTriggerSource === 'end' &&
          mode[0] === 'date' &&
          mode[1] === 'date' &&
          startValue.isSame(value[1], 'month')
      ) {
        startValue = startValue.clone().subtract(1, 'month');
      }

      return startValue;
    };
    const onDayHover = (value) => {
      let hoverValue = [];
      const selectedValue = sSelectedValue.value;
      const sFirstSelectedValue = firstSelectedValue.value;
      const type = props.type;
      if (type === 'start' && selectedValue[1]) {
        hoverValue = compare(value, selectedValue[1]) < 0 ? [value, selectedValue[1]] : [value];
      } else if (type === 'end' && selectedValue[0]) {
        hoverValue = compare(value, selectedValue[0]) > 0 ? [selectedValue[0], value] : [];
      } else {
        if (!sFirstSelectedValue) {
          if (sHoverValue.value.length) {
            sHoverValue.value = [];
          }
          return hoverValue;
        }
        hoverValue =
            compare(value, sFirstSelectedValue) < 0
                ? [value, sFirstSelectedValue]
                : [sFirstSelectedValue, value];
      }
      fireHoverValueChange(hoverValue);
      return hoverValue;
    };
    const onDatePanelEnter = () => {
      if (hasSelectedValue()) {
        fireHoverValueChange(sSelectedValue.value.concat());
      }
    };
    const fireValueChange = (value) => {
      if (props.value === undefined) {
        sValue.value = value;
      }
      emit('valueChange', value);
    };
    const onInputSelect = (direction?, value?, cause?) => {
      if (!value) {
        return;
      }
      const originalValue = sSelectedValue.value;
      const selectedValue = originalValue.concat();
      const index = direction === 'left' ? 0 : 1;
      selectedValue[index] = value;
      if (selectedValue[0] && compare(selectedValue[0], selectedValue[1]) > 0) {
        selectedValue[1 - index] = sShowTimePicker.value ? selectedValue[index] : undefined;
      }
      emit('inputSelect', selectedValue);
      fireSelectValueChange(selectedValue, null, cause || {source: 'dateInput'});
    };
    const disabledStartTime = (time) => {
      return props.disabledTime(time, 'start');
    };
    const disabledEndTime = (time) => {
      return props.disabledTime(time, 'end');
    };
    const isAllowedDateAndTime = (selectedValue) => {
      return (
          isAllowedDate(selectedValue[0], props.disabledDate, disabledStartTime) &&
          isAllowedDate(selectedValue[1], props.disabledDate, disabledEndTime)
      );
    };
    const fireSelectValueChange = (selectedValue, direct?, cause?) => {
      const prevSelectedVal = prevSelectedValue.value;
      const {timePicker} = props;
      if (timePicker) {
        const timePickerProps = getOptionProps(timePicker);
        if (timePickerProps.defaultValue) {
          const timePickerDefaultValue = timePickerProps.defaultValue;
          if (!prevSelectedVal[0] && selectedValue[0]) {
            syncTime(timePickerDefaultValue[0], selectedValue[0]);
          }
          if (!prevSelectedVal[1] && selectedValue[1]) {
            syncTime(timePickerDefaultValue[1], selectedValue[1]);
          }
        }
      }
      // 尚未选择过时间，直接输入的话
      if (!sSelectedValue.value[0] || !sSelectedValue.value[1]) {
        const startValue = selectedValue[0] || moment();
        const endValue = selectedValue[1] || startValue.clone().add(1, 'months');
        sSelectedValue.value = selectedValue;
        sValue.value = selectedValue && selectedValue.length === 2
            ? getValueFromSelectedValue([startValue, endValue])
            : sValue.value;
      }

      if (selectedValue[0] && !selectedValue[1]) {
        firstSelectedValue.value = selectedValue[0];
        fireHoverValueChange(selectedValue.concat());
      }
      emit('change', selectedValue);
      if (direct || (selectedValue[0] && selectedValue[1])) {
        prevSelectedValue.value = selectedValue;
        firstSelectedValue.value = null;
        fireHoverValueChange([]);
        emit('select', selectedValue, cause);
      }
      if (props.selectedValue === undefined) {
        sSelectedValue.value = selectedValue;
      }
    };
    watch(() => props.value, (val) => {
      sValue.value = normalizeAnchor(props, 0);
    });
    watch(() => props.hoverValue, (val) => {
      if (!isArraysEqual(sHoverValue.value, val)) {
        sHoverValue.value = val;
      }
    });
    watch(() => props.selectedValue.value, (val) => {
      sSelectedValue.value = val;
      prevSelectedValue.value = val;
    });
    watch(() => props.mode, (val) => {
      if (!isArraysEqual(sMode.value, val)) {
        sMode.value = val;
      }
    });
    return {
      getFormat,
      sSelectedValue,
      prevSelectedValue,
      firstSelectedValue,
      sHoverValue,
      sValue,
      sShowTimePicker,
      sMode,
      sPanelTriggerSource, // Trigger by which picker panel: 'start' & 'end'
      onDatePanelEnter,

      onDatePanelLeave() {
        if (hasSelectedValue()) {
          fireHoverValueChange([]);
        }
      },
      onSelect,
      onKeyDown(event) {
        if (event.target.nodeName.toLowerCase() === 'input') {
          return;
        }

        const {keyCode} = event;
        const ctrlKey = event.ctrlKey || event.metaKey;
        const selectedValue = sSelectedValue.value;
        const hoverValue = sHoverValue.value;
        const value = sValue.value;
        const {disabledDate} = props;

        // Update last time of the picker
        const updateHoverPoint = func => {
          // Change hover to make focus in UI
          let currentHoverTime;
          let nextHoverTime;
          let nextHoverValue;

          if (!firstSelectedValue.value) {
            currentHoverTime = hoverValue[0] || selectedValue[0] || value[0] || moment();
            nextHoverTime = func(currentHoverTime);
            nextHoverValue = [nextHoverTime];
            fireHoverValueChange(nextHoverValue);
          } else {
            if (hoverValue.length === 1) {
              currentHoverTime = hoverValue[0].clone();
              nextHoverTime = func(currentHoverTime);
              nextHoverValue = onDayHover(nextHoverTime);
            } else {
              currentHoverTime = hoverValue[0].isSame(firstSelectedValue.value, 'day')
                  ? hoverValue[1]
                  : hoverValue[0];
              nextHoverTime = func(currentHoverTime);
              nextHoverValue = onDayHover(nextHoverTime);
            }
          }

          // Find origin hover time on value index
          if (nextHoverValue.length >= 2) {
            const miss = nextHoverValue.some(ht => !includesTime(value, ht, 'month'));
            if (miss) {
              const newValue = nextHoverValue.slice().sort((t1, t2) => t1.valueOf() - t2.valueOf());
              if (newValue[0].isSame(newValue[1], 'month')) {
                newValue[1] = newValue[0].clone().add(1, 'month');
              }
              fireValueChange(newValue);
            }
          } else if (nextHoverValue.length === 1) {
            // If only one value, let's keep the origin panel
            let oriValueIndex = value.findIndex(time => time.isSame(currentHoverTime, 'month'));
            if (oriValueIndex === -1) {
              oriValueIndex = 0;
            }

            if (value.every(time => !time.isSame(nextHoverTime, 'month'))) {
              const newValue = value.slice();
              newValue[oriValueIndex] = nextHoverTime.clone();
              fireValueChange(newValue);
            }
          }

          event.preventDefault();

          return nextHoverTime;
        };

        switch (keyCode) {
          case KeyCode.DOWN:
            updateHoverPoint(time => goTime(time, 1, 'weeks'));
            return;
          case KeyCode.UP:
            updateHoverPoint(time => goTime(time, -1, 'weeks'));
            return;
          case KeyCode.LEFT:
            if (ctrlKey) {
              updateHoverPoint(time => goTime(time, -1, 'years'));
            } else {
              updateHoverPoint(time => goTime(time, -1, 'days'));
            }
            return;
          case KeyCode.RIGHT:
            if (ctrlKey) {
              updateHoverPoint(time => goTime(time, 1, 'years'));
            } else {
              updateHoverPoint(time => goTime(time, 1, 'days'));
            }
            return;
          case KeyCode.HOME:
            updateHoverPoint(time => goStartMonth(time));
            return;
          case KeyCode.END:
            updateHoverPoint(time => goEndMonth(time));
            return;
          case KeyCode.PAGE_DOWN:
            updateHoverPoint(time => goTime(time, 1, 'month'));
            return;
          case KeyCode.PAGE_UP:
            updateHoverPoint(time => goTime(time, -1, 'month'));
            return;
          case KeyCode.ENTER: {
            let lastValue;
            if (hoverValue.length === 0) {
              lastValue = updateHoverPoint(time => time);
            } else if (hoverValue.length === 1) {
              lastValue = hoverValue[0];
            } else {
              lastValue = hoverValue[0].isSame(firstSelectedValue, 'day')
                  ? hoverValue[1]
                  : hoverValue[0];
            }
            if (lastValue && (!disabledDate || !disabledDate(lastValue))) {
              onSelect(lastValue);
            }
            event.preventDefault();
            return;
          }
          default:
            emit('keydown', event);
        }
      },
      onDayHover,

      onToday() {
        const startValue = getTodayTime(sValue.value[0]);
        const endValue = startValue.clone().add(1, 'months');
        sValue.value = [startValue, endValue];
      },

      onOpenTimePicker() {
        sShowTimePicker.value = true;
      },
      onCloseTimePicker() {
        sShowTimePicker.value = false;
      },

      onOk() {
        if (isAllowedDateAndTime(sSelectedValue.value)) {
          emit('ok', sSelectedValue.value);
        }
      },

      onStartInputChange(...oargs) {
        const args = ['left'].concat(oargs);
        return onInputSelect(...args);
      },

      onEndInputChange(...oargs) {
        const args = ['right'].concat(oargs);
        return onInputSelect(...args);
      },

      onStartInputSelect(value) {
        const args = ['left', value, {source: 'dateInputSelect'}];
        return onInputSelect(...args);
      },

      onEndInputSelect(value) {
        const args = ['right', value, {source: 'dateInputSelect'}];
        return onInputSelect(...args);
      },

      onStartValueChange(leftValue) {
        const value = [...sValue.value];
        value[0] = leftValue;
        return fireValueChange(value);
      },

      onEndValueChange(rightValue) {
        const value = [...sValue.value];
        value[1] = rightValue;
        return fireValueChange(value);
      },

      onStartPanelChange(value, mode) {
        const newMode = [mode, sMode.value[1]];
        const newValue = [value || sValue.value[0], sValue.value[1]];
        emit('panelChange', newValue, newMode);
        sPanelTriggerSource.value = 'start';
        if (props.mode === undefined) {
          sMode.value = newMode;
        }
      },

      onEndPanelChange(value, mode) {
        const newMode = [sMode.value[0], mode];
        const newValue = [sValue.value[0], value || sValue.value[1]];
        emit('panelChange', newValue, newMode);
        sPanelTriggerSource.value = 'start';
        if (props.mode === undefined) {
          sMode.value = newMode;
        }
      },
      getStartValue,
      getEndValue() {
        const selectedValue = sSelectedValue.value;
        const showTimePicker = sShowTimePicker.value;
        const value = sValue.value;
        const mode = sMode.value;
        const panelTriggerSource = sPanelTriggerSource.value;
        let endValue = value[1] ? value[1].clone() : value[0].clone().add(1, 'month');
        // keep selectedTime when select date
        if (selectedValue[1] && props.timePicker) {
          syncTime(selectedValue[1], endValue);
        }
        if (showTimePicker) {
          endValue = selectedValue[1] ? selectedValue[1] : getStartValue();
        }

        // Adjust month if date not align
        if (
            !showTimePicker &&
            panelTriggerSource !== 'end' &&
            mode[0] === 'date' &&
            mode[1] === 'date' &&
            endValue.isSame(value[0], 'month')
        ) {
          endValue = endValue.clone().add(1, 'month');
        }

        return endValue;
      },
      // get disabled hours for second picker
      getEndDisableTime() {
        const selectedValue = sSelectedValue.value;
        const value = sValue.value;
        const {disabledTime} = props;
        const userSettingDisabledTime = disabledTime(selectedValue, 'end') || {};
        const startValue = (selectedValue && selectedValue[0]) || value[0].clone();
        // if startTime and endTime is same day..
        // the second time picker will not able to pick time before first time picker
        if (!selectedValue[1] || startValue.isSame(selectedValue[1], 'day')) {
          const hours = startValue.hour();
          const minutes = startValue.minute();
          const second = startValue.second();
          let {disabledHours, disabledMinutes, disabledSeconds} = userSettingDisabledTime;
          const oldDisabledMinutes = disabledMinutes ? disabledMinutes() : [];
          const olddisabledSeconds = disabledSeconds ? disabledSeconds() : [];
          disabledHours = generateOptions(hours, disabledHours);
          disabledMinutes = generateOptions(minutes, disabledMinutes);
          disabledSeconds = generateOptions(second, disabledSeconds);
          return {
            disabledHours() {
              return disabledHours;
            },
            disabledMinutes(hour) {
              if (hour === hours) {
                return disabledMinutes;
              }
              return oldDisabledMinutes;
            },
            disabledSeconds(hour, minute) {
              if (hour === hours && minute === minutes) {
                return disabledSeconds;
              }
              return olddisabledSeconds;
            }
          };
        }
        return userSettingDisabledTime;
      },
      isAllowedDateAndTime,
      isMonthYearPanelShow(mode) {
        return ['month', 'year', 'decade'].indexOf(mode) > -1;
      },
      hasSelectedValue,
      compare,

      fireSelectValueChange,

      fireValueChange,
      fireHoverValueChange,
      clear() {
        fireSelectValueChange([], true);
        emit('clear');
      },

      disabledStartTime,
      disabledEndTime,
      disabledStartMonth(month) {
        const value = sValue.value;
        return month.isAfter(value[1], 'month');
      },
      disabledEndMonth(month) {
        const value = sValue.value;
        return month.isBefore(value[0], 'month');
      }
    };
  },
  render(ctx) {
    const instance = getCurrentInstance();
    const props = getOptionProps(instance);
    const {
      prefixCls,
      dateInputPlaceholder,
      timePicker,
      showOk,
      locale,
      showClear,
      showToday,
      type,
      seperator
    } = props;
    const clearIcon = getComponentFromProp(instance, 'clearIcon');
    const {sHoverValue, sSelectedValue, sMode: mode, sShowTimePicker, sValue} = ctx;
    const className = {
      [prefixCls]: 1,
      [`${prefixCls}-hidden`]: !props.visible,
      [`${prefixCls}-range`]: 1,
      [`${prefixCls}-show-time-picker`]: sShowTimePicker,
      [`${prefixCls}-week-number`]: props.showWeekNumber
    };
    const baseProps = {
      ...props,
      ...getListenersFromInstance(instance)
    };
    const newProps = {
      selectedValue: sSelectedValue,
      onSelect: this.onSelect,
      onDayHover:
          (type === 'start' && sSelectedValue[1]) ||
          (type === 'end' && sSelectedValue[0]) ||
          !!sHoverValue.length
              ? this.onDayHover
              : noop
    };

    let placeholder1;
    let placeholder2;

    if (dateInputPlaceholder) {
      if (Array.isArray(dateInputPlaceholder)) {
        [placeholder1, placeholder2] = dateInputPlaceholder;
      } else {
        placeholder1 = placeholder2 = dateInputPlaceholder;
      }
    }
    const showOkButton = showOk === true || (showOk !== false && !!timePicker);
    const cls = {
      [`${prefixCls}-footer`]: true,
      [`${prefixCls}-range-bottom`]: true,
      [`${prefixCls}-footer-show-ok`]: showOkButton
    };

    const startValue = this.getStartValue();
    const endValue = this.getEndValue();
    const todayTime = getTodayTime(startValue);
    const thisMonth = todayTime.month();
    const thisYear = todayTime.year();
    const isTodayInView =
        (startValue.year() === thisYear && startValue.month() === thisMonth) ||
        (endValue.year() === thisYear && endValue.month() === thisMonth);
    const nextMonthOfStart = startValue.clone().add(1, 'months');
    const isClosestMonths =
        nextMonthOfStart.year() === endValue.year() && nextMonthOfStart.month() === endValue.month();
    const leftPartProps = mergeProps(baseProps, newProps, {
      hoverValue: sHoverValue,
      direction: 'left',
      disabledTime: this.disabledStartTime,
      disabledMonth: this.disabledStartMonth,
      format: this.getFormat(),
      value: startValue,
      mode: mode[0],
      placeholder: placeholder1,
      showDateInput: this.showDateInput,
      timePicker,
      showTimePicker: sShowTimePicker || mode[0] === 'time',
      enablePrev: true,
      enableNext: !isClosestMonths || this.isMonthYearPanelShow(mode[1]),
      clearIcon,
      onInputChange: this.onStartInputChange,
      onInputSelect: this.onStartInputSelect,
      onValueChange: this.onStartValueChange,
      onPanelChange: this.onStartPanelChange
    });
    const rightPartProps = mergeProps(baseProps, newProps, {
      hoverValue: sHoverValue,
      direction: 'right',
      format: this.getFormat(),
      timePickerDisabledTime: this.getEndDisableTime(),
      placeholder: placeholder2,
      value: endValue,
      mode: mode[1],
      showDateInput: this.showDateInput,
      timePicker,
      showTimePicker: sShowTimePicker || mode[1] === 'time',
      disabledTime: this.disabledEndTime,
      disabledMonth: this.disabledEndMonth,
      enablePrev: !isClosestMonths || this.isMonthYearPanelShow(mode[0]),
      enableNext: true,
      clearIcon,
      onInputChange: this.onEndInputChange,
      onInputSelect: this.onEndInputSelect,
      onValueChange: this.onEndValueChange,
      onPanelChange: this.onEndPanelChange
    });
    let TodayButtonNode = null;
    if (showToday) {
      const todayButtonProps = mergeProps(baseProps, {
        disabled: isTodayInView,
        value: sValue[0],
        text: locale.backToToday,
        onToday: this.onToday
      });
      TodayButtonNode = <TodayButton key="todayButton" {...todayButtonProps} />;
    }

    let TimePickerButtonNode = null;
    if (props.timePicker) {
      const timePickerButtonProps = mergeProps(baseProps, {
        showTimePicker: sShowTimePicker || (mode[0] === 'time' && mode[1] === 'time'),
        timePickerDisabled: !this.hasSelectedValue() || sHoverValue.length,
        onOpenTimePicker: this.onOpenTimePicker,
        onCloseTimePicker: this.onCloseTimePicker
      });
      TimePickerButtonNode = <TimePickerButton key="timePickerButton" {...timePickerButtonProps} />;
    }

    let OkButtonNode = null;
    if (showOkButton) {
      const okButtonProps = mergeProps(baseProps, {
        okDisabled:
            !this.isAllowedDateAndTime(sSelectedValue) ||
            !this.hasSelectedValue() ||
            sHoverValue.length,
        onOk: this.onOk
      });
      OkButtonNode = <OkButton key="okButtonNode" {...okButtonProps} />;
    }
    const extraFooter = this.renderFooter(mode);
    return (
        <div ref="rootInstance" class={className} tabindex={0} onKeydown={this.onKeyDown}>
          {props.renderSidebar()}
          <div class={`${prefixCls}-panel`}>
            {showClear && sSelectedValue[0] && sSelectedValue[1] ? (
                <a role="button" title={locale.clear} onClick={this.clear}>
                  {clearIcon || <span class={`${prefixCls}-clear-btn`}/>}
                </a>
            ) : null}
            <div
                class={`${prefixCls}-date-panel`}
                onMouseleave={type !== 'both' ? this.onDatePanelLeave : noop}
                onMouseenter={type !== 'both' ? this.onDatePanelEnter : noop}
            >
              <CalendarPart {...leftPartProps} />
              <span class={`${prefixCls}-range-middle`}>{seperator}</span>
              <CalendarPart {...rightPartProps} />
            </div>
            <div class={cls}>
              {showToday || props.timePicker || showOkButton || extraFooter ? (
                  <div class={`${prefixCls}-footer-btn`}>
                    {extraFooter}
                    {TodayButtonNode}
                    {TimePickerButtonNode}
                    {OkButtonNode}
                  </div>
              ) : null}
            </div>
          </div>
        </div>
    );
  }
}) as any;

export default RangeCalendar;
