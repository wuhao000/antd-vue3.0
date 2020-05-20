import {useLocalValue} from '@/tools/value';
import {defineComponent, getCurrentInstance} from 'vue';
import BaseMixin from '../../../_util/base-mixin';
import {getListenersFromInstance} from '../../../_util/props-util';
import PropTypes from '../../../_util/vue-types';
import MonthTable from './month-table';

function noop() {
}

const MonthPanel = defineComponent({
  name: 'MonthPanel',
  props: {
    value: PropTypes.any,
    defaultValue: PropTypes.any,
    cellRender: PropTypes.any,
    contentRender: PropTypes.any,
    locale: PropTypes.any,
    rootPrefixCls: PropTypes.string,
    // onChange: PropTypes.func,
    disabledDate: PropTypes.func,
    // onSelect: PropTypes.func,
    renderFooter: PropTypes.func,
    changeYear: PropTypes.func.def(noop)
  },
  setup(props, {emit}) {
    const {value: sValue, setValue} = useLocalValue(props.defaultValue);
    const goYear = (direction) => {
      props.changeYear(direction);
    }
    return {
      sValue, setValue,
      nextYear: () => {
        goYear(1);
      },
      previousYear: () => {
        goYear(-1);
      },
      setAndSelectValue(value) {
        setValue(value);
        emit('select', value);
      }
    };
  },
  methods: {},
  render() {
    const currentInstance = getCurrentInstance();
    const {
      sValue,
      cellRender,
      contentRender,
      locale,
      rootPrefixCls,
      disabledDate,
      renderFooter
    } = this;
    const year = sValue.year();
    const prefixCls = `${rootPrefixCls}-month-panel`;

    const footer = renderFooter && renderFooter('month');
    return (
        <div class={prefixCls}>
          <div>
            <div class={`${prefixCls}-header`}>
              <a
                  class={`${prefixCls}-prev-year-btn`}
                  role="button"
                  onClick={this.previousYear}
                  title={locale.previousYear}
              />
              <a
                  class={`${prefixCls}-year-select`}
                  role="button"
                  onClick={getListenersFromInstance(currentInstance).yearPanelShow || noop}
                  title={locale.yearSelect}
              >
                <span class={`${prefixCls}-year-select-content`}>{year}</span>
                <span class={`${prefixCls}-year-select-arrow`}>x</span>
              </a>
              <a
                  class={`${prefixCls}-next-year-btn`}
                  role="button"
                  onClick={this.nextYear}
                  title={locale.nextYear}
              />
            </div>
            <div class={`${prefixCls}-body`}>
              <MonthTable
                  disabledDate={disabledDate}
                  onSelect={this.setAndSelectValue}
                  locale={locale}
                  value={sValue}
                  cellRender={cellRender}
                  contentRender={contentRender}
                  prefixCls={prefixCls}/>
            </div>
            {footer && <div class={`${prefixCls}-footer`}>{footer}</div>}
          </div>
        </div>
    );
  }
}) as any;

export default MonthPanel;
