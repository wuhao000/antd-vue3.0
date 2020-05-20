import {useLocalValue} from '@/tools/value';
import * as moment from 'moment';
import {defineComponent, getCurrentInstance, ref, watch} from 'vue';
import interopDefault from '../_util/interopDefault';
import {getListeners, getOptionProps, initDefaultProps} from '../_util/props-util';
import PropTypes from '../_util/vue-types';
import Base from '../base';
import {useConfigProvider} from '../config-provider';
import FullCalendar from '../vc-calendar/src/full-calendar';
import Header from './Header';
import enUS from './locale/zh_CN';

function zerofixed(v) {
  if (v < 10) {
    return `0${v}`;
  }
  return `${v}`;
}

export const MomentType = {
  type: Object,
  validator(value) {
    return moment.isMoment(value);
  }
};

function isMomentArray(value) {
  return Array.isArray(value) && !!value.find(val => moment.isMoment(val));
}

export const CalendarMode = PropTypes.oneOf(['month', 'year']);

export const CalendarProps = () => ({
  prefixCls: PropTypes.string,
  value: MomentType,
  defaultValue: MomentType,
  mode: CalendarMode,
  fullscreen: PropTypes.bool,
  // dateCellRender: PropTypes.func,
  // monthCellRender: PropTypes.func,
  // dateFullCellRender: PropTypes.func,
  // monthFullCellRender: PropTypes.func,
  locale: PropTypes.object,
  // onPanelChange?: (date?: moment.Moment, mode?: CalendarMode) => void;
  // onSelect?: (date?: moment.Moment) => void;
  disabledDate: PropTypes.func,
  validRange: PropTypes.custom(isMomentArray),
  headerRender: PropTypes.func
});

const Calendar = defineComponent({
  name: 'ACalendar',
  props: initDefaultProps(CalendarProps(), {
    locale: {},
    fullscreen: true
  }),
  setup(props, {emit, slots}) {
    const configProvider = useConfigProvider();
    const sMode = ref(props.mode || 'month');
    const {setValue: updateValue, getValue} = useLocalValue(props.defaultValue || interopDefault(moment)());
    const onPanelChange = (value, mode) => {
      emit('panelChange', value, mode);
      if (value !== getValue()) {
        emit('change', value);
      }
    };
    const setValue = (value, way) => {
      const prevValue = getValue();
      const mode = sMode.value;
      if (way === 'select') {
        if (prevValue && prevValue.month() !== value.month()) {
          onPanelChange(value, mode);
        }
        updateValue(value, way);
      } else if (way === 'changePanel') {
        onPanelChange(value, mode);
      }
    };
    const onHeaderTypeChange = (mode) => {
      sMode.value = mode;
      onPanelChange(getValue(), mode);
    };
    const onHeaderValueChange = (value) => {
      setValue(value, 'changePanel');
    };
    const onSelect = (value) => {
      setValue(value, 'select');
    };
    const getDateRange = (validRange, disabledDate) => {
      return current => {
        if (!current) {
          return false;
        }
        const [startDate, endDate] = validRange;
        const inRange = !current.isBetween(startDate, endDate, 'days', '[]');
        if (disabledDate) {
          return disabledDate(current) || inRange;
        }
        return inRange;
      };
    };
    const getDefaultLocale = () => {
      const result = {
        ...enUS,
        ...props.locale
      };
      result.lang = {
        ...result.lang,
        ...(props.locale || {}).lang
      };
      return result;
    };
    watch(() => props.mode, (val) => {
      sMode.value = val;
    });
    const currentInstance = getCurrentInstance();
    const renderCalendar = (locale, localeCode) => {
      const props = getOptionProps(currentInstance);
      if (getValue() && localeCode) {
        getValue().locale(localeCode);
      }
      const {
        prefixCls: customizePrefixCls,
        fullscreen,
        dateFullCellRender,
        monthFullCellRender
      } = props;
      const headerRender = props.headerRender || (slots.headerRender && slots.headerRender());
      const getPrefixCls = configProvider.getPrefixCls;
      const prefixCls = getPrefixCls('fullcalendar', customizePrefixCls);

      // To support old version react.
      // Have to add prefixCls on the instance.
      // https://github.com/facebook/react/issues/12397

      let cls = '';
      if (fullscreen) {
        cls += ` ${prefixCls}-fullscreen`;
      }

      const monthCellRender =
          monthFullCellRender || (slots.monthFullCellRender && slots.monthFullCellRender())
          || props.monthCellRender2;
      const dateCellRender =
          dateFullCellRender || (slots.dateFullCellRender
          && slots.dateFullCellRender()) || props.dateCellRender2;

      let disabledDate = props.disabledDate;

      if (props.validRange) {
        disabledDate = getDateRange(props.validRange, disabledDate);
      }
      const fullCalendarProps = {
        ...props,
        Select: {},
        locale: locale.lang,
        type: props.mode === 'year' ? 'month' : 'date',
        prefixCls,
        showHeader: false,
        value: getValue(),
        monthCellRender,
        dateCellRender,
        disabledDate,
        ...getListeners(currentInstance),
        select: onSelect
      };
      return (
          <div class={cls}>
            <Header
                fullscreen={fullscreen}
                type={props.mode}
                headerRender={headerRender}
                value={getValue()}
                locale={locale.lang}
                prefixCls={prefixCls}
                onTypeChange={onHeaderTypeChange}
                onValueChange={onHeaderValueChange}
                validRange={props.validRange}
            />
            <FullCalendar {...fullCalendarProps} />
          </div>
      );
    };
    return {renderCalendar, getDefaultLocale};
  },

  render(ctx) {
    return ctx.renderCalendar(ctx.getDefaultLocale());
  }
}) as any;

/* istanbul ignore next */
Calendar.install = function(Vue) {
  Vue.use(Base);
  Vue.component(Calendar.name, Calendar);
};
export {HeaderProps} from './Header';
export default Calendar;
