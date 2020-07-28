import {useLocalValue} from '@/tools/value';
import {defineComponent} from 'vue';
import PropTypes from '../../../_util/vue-types';
import {getMonthName, getTodayTime} from '../util/index';

const ROW = 4;
const COL = 3;


function noop() {
}

const MonthTable = defineComponent(defineComponent({
  props: {
    cellRender: PropTypes.func,
    prefixCls: PropTypes.string,
    value: PropTypes.object,
    locale: PropTypes.any,
    contentRender: PropTypes.any,
    disabledDate: PropTypes.func
  },
  setup($props, {emit}) {
    const {value, setValue, getValue} = useLocalValue();
    const months = () => {
      const current = getValue().clone();
      const monthsValue = [];
      let index = 0;
      for (let rowIndex = 0; rowIndex < ROW; rowIndex++) {
        monthsValue[rowIndex] = [];
        for (let colIndex = 0; colIndex < COL; colIndex++) {
          current.month(index);
          const content = getMonthName(current);
          monthsValue[rowIndex][colIndex] = {
            value: index,
            content,
            title: content
          };
          index++;
        }
      }
      return monthsValue;
    };
    const setAndSelectValue = (val) => {
      setValue(val);
      emit('select', val);
    };
    const chooseMonth = (month) => {
      const next = getValue().clone();
      next.month(month);
      setAndSelectValue(next);
    };
    return {
      sValue: value,
      chooseMonth,
      months
    };
  },
  render() {
    const props = this.$props;
    const value = this.sValue;
    const today = getTodayTime(value);
    const months = this.months();
    const currentMonth = value.month();
    const {prefixCls, locale, contentRender, cellRender, disabledDate} = props;
    const monthsEls = months.map((month, index) => {
      const tds = month.map(monthData => {
        let disabled = false;
        if (disabledDate) {
          const testValue = value.clone();
          testValue.month(monthData.value);
          disabled = disabledDate(testValue);
        }
        const classNameMap = {
          [`${prefixCls}-cell`]: 1,
          [`${prefixCls}-cell-disabled`]: disabled,
          [`${prefixCls}-selected-cell`]: monthData.value === currentMonth,
          [`${prefixCls}-current-cell`]:
          today.year() === value.year() && monthData.value === today.month()
        };
        let cellEl;
        if (cellRender) {
          const currentValue = value.clone();
          currentValue.month(monthData.value);
          cellEl = cellRender(currentValue, locale);
        } else {
          let content;
          if (contentRender) {
            const currentValue = value.clone();
            currentValue.month(monthData.value);
            content = contentRender(currentValue, locale);
          } else {
            content = monthData.content;
          }
          cellEl = <a class={`${prefixCls}-month`}>{content}</a>;
        }
        return (
            <td role="gridcell"
                key={monthData.value}
                onClick={disabled ? noop : this.chooseMonth.bind(this, monthData.value)}
                title={monthData.title}
                class={classNameMap}>
              {cellEl}
            </td>
        );
      });
      return (
          <tr key={index} role="row">
            {tds}
          </tr>
      );
    });

    return (
        <table class={`${prefixCls}-table`} cellspacing="0" role="grid">
          <tbody class={`${prefixCls}-tbody`}>{monthsEls}</tbody>
        </table>
    );
  }
})) as any;

export default MonthTable;
