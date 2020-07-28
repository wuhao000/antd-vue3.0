import {getComponentFromProp} from '@/components/_util/props-util';
import {getCurrentInstance, ref, defineComponent} from 'vue';
import KeyCode from '../../_util/keycode';
import PropTypes from '../../_util/vue-types';
import CalendarFooter from './calendar/calendar-footer';
import CalendarHeader from './calendar/calendar-header';
import enUs from './locale/zh_CN';
import {useCalendarMixin} from './mixin/calendar-mixin';

export default defineComponent({
  name: 'MonthCalendar',
  props: {
    locale: PropTypes.object.def(enUs),
    format: PropTypes.string,
    visible: PropTypes.bool.def(true),
    prefixCls: PropTypes.string.def('rc-calendar'),
    monthCellRender: PropTypes.func,
    value: PropTypes.object,
    defaultValue: PropTypes.object,
    selectedValue: PropTypes.object,
    defaultSelectedValue: PropTypes.object,
    disabledDate: PropTypes.func,
    monthCellContentRender: PropTypes.func,
    renderFooter: PropTypes.func.def(() => null),
    renderSidebar: PropTypes.func.def(() => null)
  },
  setup(props, {emit}) {
    const onKeyDown = (event) => {
      const keyCode = event.keyCode;
      const ctrlKey = event.ctrlKey || event.metaKey;
      const stateValue = sValue.value;
      const {disabledDate} = props;
      let value = stateValue;
      switch (keyCode) {
        case KeyCode.DOWN:
          value = stateValue.clone();
          value.add(3, 'months');
          break;
        case KeyCode.UP:
          value = stateValue.clone();
          value.add(-3, 'months');
          break;
        case KeyCode.LEFT:
          value = stateValue.clone();
          if (ctrlKey) {
            value.add(-1, 'years');
          } else {
            value.add(-1, 'months');
          }
          break;
        case KeyCode.RIGHT:
          value = stateValue.clone();
          if (ctrlKey) {
            value.add(1, 'years');
          } else {
            value.add(1, 'months');
          }
          break;
        case KeyCode.ENTER:
          if (!disabledDate || !disabledDate(stateValue)) {
            onSelect(stateValue);
          }
          event.preventDefault();
          return 1;
        default:
          return undefined;
      }
      if (value !== stateValue) {
        setValue(value);
        event.preventDefault();
        return 1;
      }
    };
    const {sValue, setSelectedValue, onSelect, renderRoot, isAllowedDate, setValue, selectedValue: sSelectedValue} = useCalendarMixin(props, emit, {
      onKeyDown
    });
    const mode = ref('month');
    return {
      renderRoot,
      isAllowedDate,
      setSelectedValue,
      mode,
      sValue,
      selectedValue: sSelectedValue,
      onSelect,
      setValue,
      handlePanelChange(_, smode) {
        if (smode !== 'date') {
          mode.value = smode;
        }
      }
    };
  },
  render(ctx) {
    const instance = getCurrentInstance();
    const props = this.$props;
    const {mode, sValue: value} = ctx;
    const {prefixCls, locale, disabledDate} = props;
    const monthCellRender = getComponentFromProp(instance, 'monthCellRender');
    const monthCellContentRender = getComponentFromProp(instance, 'monthCellContentRender');
    const renderFooter = getComponentFromProp(instance, 'renderFooter');
    const children = (
        <div class={`${prefixCls}-month-calendar-content`}>
          <div class={`${prefixCls}-month-header-wrap`}>
            <CalendarHeader
                prefixCls={prefixCls}
                mode={mode}
                value={value}
                locale={locale}
                disabledMonth={disabledDate}
                monthCellRender={monthCellRender}
                monthCellContentRender={monthCellContentRender}
                onMonthSelect={ctx.onSelect}
                onValueChange={ctx.setValue}
                onPanelChange={ctx.handlePanelChange}
            />
          </div>
          <CalendarFooter prefixCls={prefixCls} renderFooter={renderFooter}/>
        </div>
    );
    return ctx.renderRoot({
      class: `${props.prefixCls}-month-calendar`,
      children
    });
  }
});
