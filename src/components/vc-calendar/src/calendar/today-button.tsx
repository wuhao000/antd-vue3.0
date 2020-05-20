import {defineComponent} from 'vue';
import {getTodayTime, getTodayTimeStr, isAllowedDate} from '../util/';

function noop() {
}

export default defineComponent({
  functional: true,
  name: 'TodayButton',
  render(ctx) {
    const context = {...ctx, ...this.$attrs};
    const {
      prefixCls,
      locale,
      value,
      timePicker,
      disabled,
      disabledDate,
      // onToday,
      text
    } = context;
    const today: any = (...args: any[]) => {
      this.$emit(today, ...args);
    };
    const localeNow = (!text && timePicker ? locale.now : text) || locale.today;
    const disabledToday = disabledDate && !isAllowedDate(getTodayTime(value), disabledDate);
    const isDisabled = disabledToday || disabled;
    const disabledTodayClass = isDisabled ? `${prefixCls}-today-btn-disabled` : '';
    return (
        <a
            class={`${prefixCls}-today-btn ${disabledTodayClass}`}
            role="button"
            onClick={isDisabled ? noop : today}
            title={getTodayTimeStr(value)}
        >
          {localeNow}
        </a>
    );
  }
});
