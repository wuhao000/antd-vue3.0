import {useLocalValue} from '@/tools/value';
import {defineComponent} from 'vue';
import {getListeners} from '../../../_util/props-util';
import PropTypes from '../../../_util/vue-types';

const ROW = 4;
const COL = 3;

function noop() {
}


export default defineComponent({
  props: {
    rootPrefixCls: PropTypes.string,
    value: PropTypes.object,
    defaultValue: PropTypes.object,
    locale: PropTypes.object,
    renderFooter: PropTypes.func
  },
  setup(props, {emit}) {
    const {value: sValue, getValue, setValue} = useLocalValue(props.defaultValue);
    const goYear = (direction) => {
      const value = getValue().clone();
      value.add(direction, 'year');
      setValue(value);
    };
    return {
      sValue,
      nextDecade() {
        goYear(10);
      },
      previousDecade() {
        goYear(-10);
      },
      chooseYear(year) {
        const value = sValue.value.clone();
        value.year(year);
        value.month(sValue.value.month());
        sValue.value = value;
        emit('select', value);
      },
      goYear,
      years() {
        const value = sValue.value;
        const currentYear = value.year();
        const startYear = parseInt((currentYear / 10).toString(), 10) * 10;
        const previousYear = startYear - 1;
        const years = [];
        let index = 0;
        for (let rowIndex = 0; rowIndex < ROW; rowIndex++) {
          years[rowIndex] = [];
          for (let colIndex = 0; colIndex < COL; colIndex++) {
            const year = previousYear + index;
            const content = String(year);
            years[rowIndex][colIndex] = {
              content,
              year,
              title: content
            };
            index++;
          }
        }
        return years;
      }
    };
  },

  render(ctx) {
    const {sValue: value, locale, renderFooter} = ctx;
    const decadePanelShow = getListeners(this).decadePanelShow || noop;
    const years = ctx.years();
    const currentYear = value.year();
    const startYear = parseInt((currentYear / 10).toString(), 10) * 10;
    const endYear = startYear + 9;
    const prefixCls = `${ctx.rootPrefixCls}-year-panel`;

    const yeasEls = years.map((row, index) => {
      const tds = row.map(yearData => {
        const classNameMap = {
          [`${prefixCls}-cell`]: 1,
          [`${prefixCls}-selected-cell`]: yearData.year === currentYear,
          [`${prefixCls}-last-decade-cell`]: yearData.year < startYear,
          [`${prefixCls}-next-decade-cell`]: yearData.year > endYear
        };
        let clickHandler: () => void;
        if (yearData.year < startYear) {
          clickHandler = ctx.previousDecade;
        } else if (yearData.year > endYear) {
          clickHandler = ctx.nextDecade;
        } else {
          clickHandler = () => {
            ctx.chooseYear(yearData.year);
          };
        }
        return (
            <td role="gridcell"
                title={yearData.title}
                key={yearData.content}
                onClick={clickHandler}
                class={classNameMap}>
              <a class={`${prefixCls}-year`}>{yearData.content}</a>
            </td>
        );
      });
      return (
          <tr key={index} role="row">
            {tds}
          </tr>
      );
    });
    const footer = renderFooter && renderFooter('year');
    return (
        <div class={prefixCls}>
          <div>
            <div class={`${prefixCls}-header`}>
              <a class={`${prefixCls}-prev-decade-btn`}
                 role="button"
                 onClick={ctx.previousDecade}
                 title={locale.previousDecade}/>
              <a class={`${prefixCls}-decade-select`}
                 role="button"
                 onClick={decadePanelShow}
                 title={locale.decadeSelect}>
                <span class={`${prefixCls}-decade-select-content`}>
                  {startYear}-{endYear}
                </span>
                <span class={`${prefixCls}-decade-select-arrow`}>x</span>
              </a>
              <a class={`${prefixCls}-next-decade-btn`}
                 role="button"
                 onClick={ctx.nextDecade}
                 title={locale.nextDecade}/>
            </div>
            <div class={`${prefixCls}-body`}>
              <table class={`${prefixCls}-table`} cellspacing="0" role="grid">
                <tbody class={`${prefixCls}-tbody`}>{yeasEls}</tbody>
              </table>
            </div>
            {footer && <div class={`${prefixCls}-footer`}>{footer}</div>}
          </div>
        </div>
    );
  }
}) as any;
