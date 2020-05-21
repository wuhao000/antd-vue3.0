import {defineComponent, getCurrentInstance, ref} from 'vue';
import {getListenersFromInstance, getOptionProps} from '../../../_util/props-util';
import PropTypes from '../../../_util/vue-types';
import DecadePanel from '../decade/decade-panel';
import MonthPanel from '../month/month-panel';
import YearPanel from '../year/year-panel';

function noop() {
}

function showIf(condition, el) {
  return condition ? el : null;
}

const CalendarHeader = defineComponent({
  name: 'CalendarHeader',
  props: {
    prefixCls: PropTypes.string,
    value: PropTypes.object,
    // onValueChange: PropTypes.func,
    showTimePicker: PropTypes.bool,
    // onPanelChange: PropTypes.func,
    locale: PropTypes.object,
    enablePrev: PropTypes.any.def(1),
    enableNext: PropTypes.any.def(1),
    disabledMonth: PropTypes.func,
    mode: PropTypes.any,
    monthCellRender: PropTypes.func,
    monthCellContentRender: PropTypes.func,
    renderFooter: PropTypes.func
  },
  setup(props, {emit, attrs}) {
    const instance = getCurrentInstance();
    const yearPanelReferer = ref(null);
    const goMonth = (direction) => {
      const next = props.value.clone();
      next.add(direction, 'months');
      emit('valueChange', next);
    };
    const goYear = (direction) => {
      const next = props.value.clone();
      next.add(direction, 'years');
      emit('valueChange', next);
    };
    const previousMonth = () => {
      goMonth(-1);
    };
    const nextMonth = () => {
      goMonth(1);
    };
    const nextYear = () => {
      goYear(1);
    };
    const previousYear = () => {
      goYear(-1);
    };
    return {
      nextMonth,
      previousMonth,
      nextYear,
      previousYear,
      yearPanelReferer,
      onMonthSelect(value) {
        emit('panelChange', value, 'date');
        if (getListenersFromInstance(instance).onMonthSelect) {
          emit('monthSelect', value);
        } else {
          emit('valueChange', value);
        }
      },
      onYearSelect(value) {
        const referer = yearPanelReferer.value;
        yearPanelReferer.value = null;
        emit('panelChange', value, referer);
        emit('valueChange', value);
      },
      onDecadeSelect(value) {
        emit('panelChange', value, 'year');
        emit('valueChange', value);
      },
      showMonthPanel() {
        // null means that users' interaction doesn't change value
        emit('panelChange', null, 'month');
      },
      showYearPanel(referer) {
        yearPanelReferer.value = referer;
        emit('panelChange', null, 'year');
      },
      showDecadePanel() {
        emit('panelChange', null, 'decade');
      },
      goMonth
    };
  },
  methods: {
    changeYear(direction) {
      if (direction > 0) {
        this.nextYear();
      } else {
        this.previousYear();
      }
    },

    monthYearElement(showTimePicker) {
      const props = this.$props;
      const prefixCls = props.prefixCls;
      const locale = props.locale;
      const value = props.value;
      const localeData = value.localeData();
      const monthBeforeYear = locale.monthBeforeYear;
      const selectClassName = `${prefixCls}-${monthBeforeYear ? 'my-select' : 'ym-select'}`;
      const timeClassName = showTimePicker ? ` ${prefixCls}-time-status` : '';
      const year = (
          <a
              class={`${prefixCls}-year-select${timeClassName}`}
              role="button"
              onClick={showTimePicker ? noop : () => this.showYearPanel('date')}
              title={showTimePicker ? null : locale.yearSelect}
          >
            {value.format(locale.yearFormat)}
          </a>
      );
      const month = (
          <a
              class={`${prefixCls}-month-select${timeClassName}`}
              role="button"
              onClick={showTimePicker ? noop : this.showMonthPanel}
              title={showTimePicker ? null : locale.monthSelect}
          >
            {locale.monthFormat ? value.format(locale.monthFormat) : localeData.monthsShort(value)}
          </a>
      );
      let day;
      if (showTimePicker) {
        day = (
            <a class={`${prefixCls}-day-select${timeClassName}`} role="button">
              {value.format(locale.dayFormat)}
            </a>
        );
      }
      let my = [];
      if (monthBeforeYear) {
        my = [month, day, year];
      } else {
        my = [year, month, day];
      }
      return <span class={selectClassName}>{my}</span>;
    }
  },

  render(ctx) {
    const instance = getCurrentInstance();
    const props = getOptionProps(instance);
    const {
      prefixCls,
      locale,
      mode,
      value,
      showTimePicker,
      enableNext,
      enablePrev,
      disabledMonth,
      renderFooter
    } = props;

    let panel = null;
    if (mode === 'month') {
      panel = (
          <MonthPanel
              locale={locale}
              value={value}
              rootPrefixCls={prefixCls}
              onSelect={ctx.onMonthSelect}
              onYearPanelShow={() => this.showYearPanel('month')}
              disabledDate={disabledMonth}
              cellRender={props.monthCellRender}
              contentRender={props.monthCellContentRender}
              renderFooter={renderFooter}
              changeYear={ctx.changeYear}
          />
      );
    }
    if (mode === 'year') {
      panel = (
          <YearPanel
              locale={locale}
              defaultValue={value}
              rootPrefixCls={prefixCls}
              onSelect={ctx.onYearSelect}
              onDecadePanelShow={ctx.showDecadePanel}
              renderFooter={renderFooter}
          />
      );
    }
    if (mode === 'decade') {
      panel = (
          <DecadePanel
              locale={locale}
              defaultValue={value}
              rootPrefixCls={prefixCls}
              onSelect={this.onDecadeSelect}
              renderFooter={renderFooter}
          />
      );
    }

    return (
        <div class={`${prefixCls}-header`}>
          <div style={{position: 'relative'}}>
            {showIf(
                enablePrev && !showTimePicker,
                <a
                    class={`${prefixCls}-prev-year-btn`}
                    role="button"
                    onClick={this.previousYear}
                    title={locale.previousYear}
                />
            )}
            {showIf(
                enablePrev && !showTimePicker,
                <a
                    class={`${prefixCls}-prev-month-btn`}
                    role="button"
                    onClick={this.previousMonth}
                    title={locale.previousMonth}
                />
            )}
            {this.monthYearElement(showTimePicker)}
            {showIf(
                enableNext && !showTimePicker,
                <a
                    class={`${prefixCls}-next-month-btn`}
                    onClick={this.nextMonth}
                    title={locale.nextMonth}
                />
            )}
            {showIf(
                enableNext && !showTimePicker,
                <a
                    class={`${prefixCls}-next-year-btn`}
                    onClick={this.nextYear}
                    title={locale.nextYear}
                />
            )}
          </div>
          {panel}
        </div>
    );
  }
}) as any;

export default CalendarHeader;
