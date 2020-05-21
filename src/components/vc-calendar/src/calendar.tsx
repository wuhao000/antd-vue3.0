import moment from 'moment';
import {defineComponent, getCurrentInstance, nextTick, onMounted, ref, watch} from 'vue';
import KeyCode from '../../_util/KeyCode';
import {getComponentFromProp, getOptionProps} from '../../_util/props-util';
import {cloneElement} from '../../_util/vnode';
import PropTypes from '../../_util/vue-types';
import CalendarFooter from './calendar/calendar-footer';
import CalendarHeader from './calendar/calendar-header';
import DateInput from './date/date-input';
import DateTable from './date/date-table';
import enUs from './locale/zh_CN';
import {useCalendarMixin} from './mixin/calendar-mixin';
import {useCommonMixin} from './mixin/common-mixin';
import {getTimeConfig, getTodayTime, syncTime} from './util';
import {goEndMonth, goStartMonth, goTime as toTime} from './util/toTime';

const getMomentObjectIfValid = date => {
  if (moment.isMoment(date) && date.isValid()) {
    return date;
  }
  return false;
};

const Calendar = defineComponent({
  name: 'Calendar',
  props: {
    locale: PropTypes.object.def(enUs),
    format: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
    visible: PropTypes.bool.def(true),
    prefixCls: PropTypes.string.def('rc-calendar'),
    // prefixCls: PropTypes.string,
    defaultValue: PropTypes.object,
    value: PropTypes.object,
    selectedValue: PropTypes.object,
    defaultSelectedValue: PropTypes.object,
    mode: PropTypes.oneOf(['time', 'date', 'month', 'year', 'decade']),
    // locale: PropTypes.object,
    showDateInput: PropTypes.bool.def(true),
    showWeekNumber: PropTypes.bool,
    showToday: PropTypes.bool.def(true),
    showOk: PropTypes.bool,
    // onSelect: PropTypes.func,
    // onOk: PropTypes.func,
    // onKeyDown: PropTypes.func,
    timePicker: PropTypes.any,
    dateInputPlaceholder: PropTypes.any,
    // onClear: PropTypes.func,
    // onChange: PropTypes.func,
    // onPanelChange: PropTypes.func,
    disabledDate: PropTypes.func,
    disabledTime: PropTypes.any,
    dateRender: PropTypes.func,
    renderFooter: PropTypes.func.def(() => null),
    renderSidebar: PropTypes.func.def(() => null),
    clearIcon: PropTypes.any,
    focusablePanel: PropTypes.bool.def(true),
    inputMode: PropTypes.string
  },

  setup(props, {emit}) {
    const sMode = ref(props.mode || 'date');
    watch(() => props.mode, (mode) => {
      sMode.value = mode;
    });
    const onBlur = (event) => {
      setTimeout(() => {
        const dateInput = DateInput.getInstance();
        if (!rootInstance.value || rootInstance.value.contains(document.activeElement) ||
            (dateInput && dateInput.contains(document.activeElement))) {
          // focused element is still part of Calendar
          return;
        }

        emit('blur', event);
      }, 0);
    };
    const onKeyDown = (event) => {
      if (event.target.nodeName.toLowerCase() === 'input') {
        return undefined;
      }
      const keyCode = event.keyCode;
      // mac
      const ctrlKey = event.ctrlKey || event.metaKey;
      const disabledDate = props.disabledDate;
      switch (keyCode) {
        case KeyCode.DOWN:
          goTime(1, 'weeks');
          event.preventDefault();
          return 1;
        case KeyCode.UP:
          goTime(-1, 'weeks');
          event.preventDefault();
          return 1;
        case KeyCode.LEFT:
          if (ctrlKey) {
            goTime(-1, 'years');
          } else {
            goTime(-1, 'days');
          }
          event.preventDefault();
          return 1;
        case KeyCode.RIGHT:
          if (ctrlKey) {
            goTime(1, 'years');
          } else {
            goTime(1, 'days');
          }
          event.preventDefault();
          return 1;
        case KeyCode.HOME:
          setValue(goStartMonth(sValue.value));
          event.preventDefault();
          return 1;
        case KeyCode.END:
          setValue(goEndMonth(sValue.value));
          event.preventDefault();
          return 1;
        case KeyCode.PAGE_DOWN:
          goTime(1, 'month');
          event.preventDefault();
          return 1;
        case KeyCode.PAGE_UP:
          goTime(-1, 'month');
          event.preventDefault();
          return 1;
        case KeyCode.ENTER:
          if (!disabledDate || !disabledDate(sValue.value)) {
            onSelect(sValue.value, {
              source: 'keyboard'
            });
          }
          event.preventDefault();
          return 1;
        default:
          emit('keydown', event);
          return 1;
      }
    };
    const {setValue, onSelect, isAllowedDate, renderRoot, setSelectedValue, selectedValue: sSelectedValue, sValue}
        = useCalendarMixin(props, emit, {onKeyDown, onBlur});
    const goTime = (direction, unit) => {
      setValue(toTime(sValue.value, direction, unit));
    };
    const onPanelChange = (value, mode) => {
      if (props.mode === undefined) {
        sMode.value = mode;
      }
      emit('panelChange', value || sValue.value, mode);
    };
    onMounted(() => {
      nextTick(() => {
        saveFocusElement(DateInput.getInstance());
      });
    });
    const {rootInstance, focus, focusElement, getFormat, saveFocusElement, setRootInstance} = useCommonMixin(props);
    return {
      rootInstance, focus, focusElement, getFormat, saveFocusElement, setRootInstance,
      sMode, sValue, selectedValue: sSelectedValue,
      setSelectedValue, setValue, renderRoot, isAllowedDate, onSelect,
      onPanelChange,
      onClear() {
        onSelect(null);
        emit('clear');
      },

      onOk() {
        if (isAllowedDate(sSelectedValue.value)) {
          emit('ok', sSelectedValue.value);
        }
      },

      onDateInputChange(value) {
        onSelect(value, {
          source: 'dateInput'
        });
      },
      onDateInputSelect(value) {
        onSelect(value, {
          source: 'dateInputSelect'
        });
      },
      onDateTableSelect(value) {
        const {timePicker} = props;
        if (!sSelectedValue.value && timePicker) {
          const timePickerProps = getOptionProps(timePicker);
          const timePickerDefaultValue = timePickerProps.defaultValue;
          if (timePickerDefaultValue) {
            syncTime(timePickerDefaultValue, value);
          }
        }
        onSelect(value);
      },
      onToday() {
        const now = getTodayTime(sValue.value);
        onSelect(now, {
          source: 'todayButton'
        });
      },
      onBlur,
      openTimePicker() {
        onPanelChange(null, 'time');
      },
      closeTimePicker() {
        onPanelChange(null, 'date');
      },
      goTime
    };
  },
  render(ctx) {
    const {
      locale,
      prefixCls,
      disabledDate,
      dateInputPlaceholder,
      timePicker,
      disabledTime,
      showDateInput,
      sValue,
      sSelectedValue,
      sMode,
      renderFooter,
      inputMode,
      monthCellRender,
      monthCellContentRender
    } = ctx;
    const instance = getCurrentInstance();
    const clearIcon = getComponentFromProp(instance, 'clearIcon');
    const showTimePicker = sMode === 'time';
    const disabledTimeConfig =
        showTimePicker && disabledTime && timePicker
            ? getTimeConfig(sSelectedValue, disabledTime)
            : null;

    let timePickerEle = null;

    if (timePicker && showTimePicker) {
      const timePickerOriginProps = getOptionProps(timePicker);
      const timePickerProps = {
        showHour: true,
        showSecond: true,
        showMinute: true,
        ...timePickerOriginProps,
        ...disabledTimeConfig,
        value: sSelectedValue,
        disabledTime,
        onChange: ctx.onDateInputChange
      };

      if (timePickerOriginProps.defaultValue !== undefined) {
        timePickerProps.props.defaultOpenValue = timePickerOriginProps.defaultValue;
      }
      timePickerEle = cloneElement(timePicker, timePickerProps);
    }

    const dateInputElement = showDateInput ? (
        <DateInput
            format={ctx.getFormat()}
            key="date-input"
            value={sValue}
            locale={locale}
            placeholder={dateInputPlaceholder}
            showClear={true}
            disabledTime={disabledTime}
            disabledDate={disabledDate}
            onClear={ctx.onClear}
            prefixCls={prefixCls}
            selectedValue={sSelectedValue}
            onChange={ctx.onDateInputChange}
            clearIcon={clearIcon}
            onSelect={ctx.onDateInputSelect}
            inputMode={inputMode}
        />
    ) : null;
    const children = [];
    if (ctx.renderSidebar) {
      children.push(ctx.renderSidebar());
    }
    children.push(
        <div class={`${prefixCls}-panel`} key="panel">
          {dateInputElement}
          <div tabindex={ctx.focusablePanel ? 0 : undefined} class={`${prefixCls}-date-panel`}>
            <CalendarHeader
                locale={locale}
                mode={sMode}
                value={sValue}
                onValueChange={ctx.setValue}
                onPanelChange={ctx.onPanelChange}
                renderFooter={renderFooter}
                showTimePicker={showTimePicker}
                prefixCls={prefixCls}
                monthCellRender={monthCellRender}
                monthCellContentRender={monthCellContentRender}
            />
            {timePicker && showTimePicker ? (
                <div class={`${prefixCls}-time-picker`}>
                  <div class={`${prefixCls}-time-picker-panel`}>{timePickerEle}</div>
                </div>
            ) : null}
            <div class={`${prefixCls}-body`}>
              <DateTable
                  locale={locale}
                  value={sValue}
                  selectedValue={sSelectedValue}
                  prefixCls={prefixCls}
                  dateRender={ctx.dateRender}
                  onSelect={ctx.onDateTableSelect}
                  disabledDate={disabledDate}
                  showWeekNumber={ctx.showWeekNumber}
              />
            </div>

            <CalendarFooter
                showOk={ctx.showOk}
                mode={sMode}
                renderFooter={ctx.renderFooter}
                locale={locale}
                prefixCls={prefixCls}
                showToday={ctx.showToday}
                disabledTime={disabledTime}
                showTimePicker={showTimePicker}
                showDateInput={ctx.showDateInput}
                timePicker={timePicker}
                selectedValue={sSelectedValue}
                value={sValue}
                disabledDate={disabledDate}
                okDisabled={
                  ctx.showOk !== false && (!sSelectedValue || !ctx.isAllowedDate(sSelectedValue))
                }
                onOk={ctx.onOk}
                onSelect={ctx.onSelect}
                onToday={ctx.onToday}
                onOpenTimePicker={ctx.openTimePicker}
                onCloseTimePicker={ctx.closeTimePicker}
            />
          </div>
        </div>
    );

    return ctx.renderRoot({
      children,
      class: ctx.showWeekNumber ? `${prefixCls}-week-number` : ''
    });
  }
}) as any;

export default Calendar;
