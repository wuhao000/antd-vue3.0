import {defineComponent, ref} from 'vue';
import PropTypes from '../../../_util/vue-types';

const ROW = 4;
const COL = 3;

export default defineComponent({
  props: {
    locale: PropTypes.object,
    value: PropTypes.object,
    defaultValue: PropTypes.object,
    rootPrefixCls: PropTypes.string,
    renderFooter: PropTypes.func
  },
  setup($props, {emit}) {
    const sValue = ref($props.value || $props.defaultValue);
    const goYear = (direction) => {
      const next = sValue.value.clone();
      next.add(direction, 'years');
      sValue.value = next;
    };
    const chooseDecade = (year, event) => {
      const next = sValue.value.clone();
      next.year(year);
      next.month(sValue.value.month());
      emit('select', next);
      event.preventDefault();
    }
    return {
      nextCentury: goYear.bind(null, 100),
      previousCentury: goYear.bind(null, -100),
      sValue,
      chooseDecade
    };
  },
  render() {
    const value = this.sValue;
    const {locale, renderFooter} = this.$props;
    const currentYear = value.year();
    const startYear = parseInt((currentYear / 100).toString(), 10) * 100;
    const preYear = startYear - 10;
    const endYear = startYear + 99;
    const decades = [];
    let index = 0;
    const prefixCls = `${this.rootPrefixCls}-decade-panel`;

    for (let rowIndex = 0; rowIndex < ROW; rowIndex++) {
      decades[rowIndex] = [];
      for (let colIndex = 0; colIndex < COL; colIndex++) {
        const startDecade = preYear + index * 10;
        const endDecade = preYear + index * 10 + 9;
        decades[rowIndex][colIndex] = {
          startDecade,
          endDecade
        };
        index++;
      }
    }

    const footer = renderFooter && renderFooter('decade');
    const decadesEls = decades.map((row, decadeIndex) => {
      const tds = row.map(decadeData => {
        const dStartDecade = decadeData.startDecade;
        const dEndDecade = decadeData.endDecade;
        const isLast = dStartDecade < startYear;
        const isNext = dEndDecade > endYear;
        const classNameMap = {
          [`${prefixCls}-cell`]: 1,
          [`${prefixCls}-selected-cell`]: dStartDecade <= currentYear && currentYear <= dEndDecade,
          [`${prefixCls}-last-century-cell`]: isLast,
          [`${prefixCls}-next-century-cell`]: isNext
        };
        const content = `${dStartDecade}-${dEndDecade}`;
        let clickHandler: any;
        if (isLast) {
          clickHandler = this.previousCentury;
        } else if (isNext) {
          clickHandler = this.nextCentury;
        } else {
          clickHandler = this.chooseDecade.bind(null, dStartDecade);
        }
        return (
            <td key={dStartDecade} onClick={clickHandler} role="gridcell" class={classNameMap}>
              <a class={`${prefixCls}-decade`}>{content}</a>
            </td>
        );
      });
      return (
          <tr key={decadeIndex} role="row">
            {tds}
          </tr>
      );
    });

    return (
        <div class={prefixCls}>
          <div class={`${prefixCls}-header`}>
            <a
                class={`${prefixCls}-prev-century-btn`}
                role="button"
                onClick={this.previousCentury}
                title={locale.previousCentury}
            />
            <div class={`${prefixCls}-century`}>
              {startYear}-{endYear}
            </div>
            <a
                class={`${prefixCls}-next-century-btn`}
                role="button"
                onClick={this.nextCentury}
                title={locale.nextCentury}
            />
          </div>
          <div class={`${prefixCls}-body`}>
            <table class={`${prefixCls}-table`} cellspacing="0" role="grid">
              <tbody class={`${prefixCls}-tbody`}>{decadesEls}</tbody>
            </table>
          </div>
          {footer && <div class={`${prefixCls}-footer`}>{footer}</div>}
        </div>
    );
  }
}) as any;
