import {getCurrentInstance} from 'vue';
import BaseMixin from '../../../_util/base-mixin';
import {getComponentFromProp, getListeners, getOptionProps} from '../../../_util/props-util';
import {cloneElement} from '../../../_util/vnode';
import PropTypes from '../../../_util/vue-types';
import CalendarHeader from '../calendar/calendar-header';
import DateInput from '../date/date-input';
import DateTable from '../date/date-table';
import {getTimeConfig} from '../util/index';

function noop() {
}

const CalendarPart = {
  name: 'CalendarPart',
  mixins: [BaseMixin],
  props: {
    prefixCls: PropTypes.string,
    value: PropTypes.any,
    hoverValue: PropTypes.any,
    selectedValue: PropTypes.any,
    direction: PropTypes.any,
    locale: PropTypes.any,
    showDateInput: PropTypes.bool,
    showTimePicker: PropTypes.bool,
    showWeekNumber: PropTypes.bool,
    format: PropTypes.any,
    placeholder: PropTypes.any,
    disabledDate: PropTypes.any,
    timePicker: PropTypes.any,
    disabledTime: PropTypes.any,
    disabledMonth: PropTypes.any,
    mode: PropTypes.any,
    // onInputSelect: PropTypes.func,
    timePickerDisabledTime: PropTypes.object,
    enableNext: PropTypes.any,
    enablePrev: PropTypes.any,
    clearIcon: PropTypes.any,
    dateRender: PropTypes.func,
    inputMode: PropTypes.string
  },
  render() {
    const instance = getCurrentInstance();
    const props = instance.props;
    const {
      prefixCls,
      value,
      hoverValue,
      selectedValue,
      mode,
      direction,
      locale,
      format,
      placeholder,
      disabledDate,
      timePicker,
      disabledTime,
      timePickerDisabledTime,
      showTimePicker,
      enablePrev,
      enableNext,
      disabledMonth,
      showDateInput,
      dateRender,
      showWeekNumber,
      showClear,
      inputMode
    } = props;
    const clearIcon = getComponentFromProp(instance, 'clearIcon');
    const {
      inputChange = noop,
      inputSelect = noop,
      valueChange = noop,
      panelChange = noop,
      select = noop,
      dayHover = noop
    } = getListeners(this);
    const shouldShowTimePicker = showTimePicker && timePicker;
    const disabledTimeConfig =
      shouldShowTimePicker && disabledTime ? getTimeConfig(selectedValue, disabledTime) : null;
    const rangeClassName = `${prefixCls}-range`;
    const newProps = {
      locale,
      value,
      prefixCls,
      showTimePicker
    };
    const index = direction === 'left' ? 0 : 1;
    let timePickerEle = null;
    if (shouldShowTimePicker) {
      const timePickerProps = getOptionProps(timePicker);
      timePickerEle = cloneElement(timePicker, {
        showHour: true,
        showMinute: true,
        showSecond: true,
        ...timePickerProps,
        ...disabledTimeConfig,
        ...timePickerDisabledTime,
        defaultOpenValue: value,
        value: selectedValue[index],
        onChange: inputChange
      });
    }

    const dateInputElement = showDateInput && (
      <DateInput
        format={format}
        locale={locale}
        prefixCls={prefixCls}
        timePicker={timePicker}
        disabledDate={disabledDate}
        placeholder={placeholder}
        disabledTime={disabledTime}
        value={value}
        showClear={showClear || false}
        selectedValue={selectedValue[index]}
        onChange={inputChange}
        onSelect={inputSelect}
        clearIcon={clearIcon}
        inputMode={inputMode}
      />
    );
    const headerProps = {
      ...newProps,
      mode,
      enableNext,
      enablePrev,
      disabledMonth,
      onValueChange: valueChange,
      onPanelChange: panelChange
    };
    const tableProps = {
      ...newProps,
      hoverValue,
      selectedValue,
      dateRender,
      disabledDate,
      showWeekNumber,
      onSelect: select,
      onDayHover: dayHover
    };
    return (
      <div class={`${rangeClassName}-part ${rangeClassName}-${direction}`}>
        {dateInputElement}
        <div style={{outline: 'none'}}>
          <CalendarHeader {...headerProps} />
          {showTimePicker ? (
            <div class={`${prefixCls}-time-picker`}>
              <div class={`${prefixCls}-time-picker-panel`}>{timePickerEle}</div>
            </div>
          ) : null}
          <div class={`${prefixCls}-body`}>
            <DateTable {...tableProps} />
          </div>
        </div>
      </div>
    );
  }
};

export default CalendarPart;
