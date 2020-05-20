import {useLocalValue} from '@/tools/value';
import PropTypes from '../../../_util/vue-types';
import BaseMixin from '../../../_util/base-mixin';
import { getTodayTime, getMonthName } from '../util/index';

const ROW = 4;
const COL = 3;

function chooseMonth(month) {
  const next = this.sValue.clone();
  next.month(month);
  this.setAndSelectValue(next);
}

function noop() {}

const MonthTable = {
  mixins: [BaseMixin],
  props: {
    cellRender: PropTypes.func,
    prefixCls: PropTypes.string,
    value: PropTypes.object,
    locale: PropTypes.any,
    contentRender: PropTypes.any,
    disabledDate: PropTypes.func,
  },
  watch: {
    value(val) {
      this.sValue = val;
    },
  },
  setup(props, {emit}) {
    const {value, setValue, getValue, context} = useLocalValue(props.defaultValue);
    return {
      sValue: value,
      setAndSelectValue(value) {
        setValue(value);
        emit('select', value);
      }
    }
  },
  methods: {
    months() {
      const value = this.sValue;
      const current = value.clone();
      const months = [];
      let index = 0;
      for (let rowIndex = 0; rowIndex < ROW; rowIndex++) {
        months[rowIndex] = [];
        for (let colIndex = 0; colIndex < COL; colIndex++) {
          current.month(index);
          const content = getMonthName(current);
          months[rowIndex][colIndex] = {
            value: index,
            content,
            title: content,
          };
          index++;
        }
      }
      return months;
    },
  },

  render(ctx) {
    const props = this.$props;
    const value = this.sValue;
    const today = getTodayTime(value);
    const months = this.months();
    const currentMonth = value.month();
    const { prefixCls, locale, contentRender, cellRender, disabledDate } = props;
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
            today.year() === value.year() && monthData.value === today.month(),
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
          <td
            role="gridcell"
            key={monthData.value}
            onClick={disabled ? noop : chooseMonth.bind(this, monthData.value)}
            title={monthData.title}
            class={classNameMap}
          >
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
      <table class={`${prefixCls}-table`} cellSpacing="0" role="grid">
        <tbody class={`${prefixCls}-tbody`}>{monthsEls}</tbody>
      </table>
    );
  },
};

export default MonthTable;
