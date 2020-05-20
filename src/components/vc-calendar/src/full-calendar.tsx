import {useCommonMixin} from '@/components/vc-calendar/src/mixin/common-mixin';
import {useLocalValue} from '@/tools/value';
import moment from 'moment';
import PropTypes from '../../_util/vue-types';
import BaseMixin from '../../_util/base-mixin';
import {getListenersFromInstance, getListenersFromProps, getOptionProps, hasProp} from '../../_util/props-util';
import DateTable from './date/date-table';
import MonthTable from './month/month-table';
import CalendarMixin, {getNowByCurrentStateValue, useCalendarMixin} from './mixin/calendar-mixin';
import CalendarHeader from './full-calendar/calendar-header';
import enUs from './locale/zh_CN';
import { getCurrentInstance, ref } from 'vue';

const FullCalendar = {
  props: {
    locale: PropTypes.object.def(enUs),
    format: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    visible: PropTypes.bool.def(true),
    prefixCls: PropTypes.string.def('rc-calendar'),
    defaultType: PropTypes.string.def('date'),
    type: PropTypes.string,
    fullscreen: PropTypes.bool.def(false),
    monthCellRender: PropTypes.func,
    dateCellRender: PropTypes.func,
    showTypeSwitch: PropTypes.bool.def(true),
    Select: PropTypes.object.isRequired,
    headerComponents: PropTypes.array,
    headerComponent: PropTypes.object, // The whole header component
    headerRender: PropTypes.func,
    showHeader: PropTypes.bool.def(true),
    disabledDate: PropTypes.func,
    value: PropTypes.object,
    defaultValue: PropTypes.object,
    selectedValue: PropTypes.object,
    defaultSelectedValue: PropTypes.object,
    renderFooter: PropTypes.func.def(() => null),
    renderSidebar: PropTypes.func.def(() => null)
  },
  setup(props, {emit}) {
    const instance = getCurrentInstance();
    const {focus, focusElement, getFormat, rootInstance, saveFocusElement, setRootInstance} = useCommonMixin(props);
    const {setValue, renderRoot, onSelect, sValue, sSelectedValue} = useCalendarMixin(props, emit, {});
    const {value: sType, setValue: setType} = useLocalValue(props.defaultType, 'type')
    return {
      sType, renderRoot,
      focus, focusElement, getFormat, rootInstance, saveFocusElement, setRootInstance,
      sValue, setValue, sSelectedValue,
      onMonthSelect(value) {
        onSelect(value, {
          target: 'month'
        });
      },
      setType(type) {
        setType(type);
        emit('typeChange', type);
      }
    };
  },
  render(ctx) {
    const currentInstance = getCurrentInstance();
    const props = getOptionProps(currentInstance);
    const {
      locale,
      prefixCls,
      fullscreen,
      showHeader,
      headerComponent,
      headerRender,
      disabledDate
    } = props;
    const { sValue: value, sType: type } = ctx;
    let header = null;
    if (showHeader) {
      if (headerRender) {
        header = headerRender(value, type, locale);
      } else {
        const TheHeader = headerComponent || CalendarHeader;
        const headerProps = {
          ...props,
          prefixCls: `${prefixCls}-full`,
          type,
          value,
          ...getListenersFromInstance(currentInstance),
          typeChange: ctx.setType,
          valueChange: ctx.setValue,
          key: 'calendar-header'
        };
        header = <TheHeader {...headerProps} />;
      }
    }

    const table =
        type === 'date' ? (
            <DateTable
                dateRender={props.dateCellRender}
                contentRender={props.dateCellContentRender}
                locale={locale}
                prefixCls={prefixCls}
                onSelect={this.onSelect}
                value={value}
                disabledDate={disabledDate}
            />
        ) : (
            <MonthTable
                cellRender={props.monthCellRender}
                contentRender={props.monthCellContentRender}
                locale={locale}
                onSelect={this.onMonthSelect}
                prefixCls={`${prefixCls}-month-panel`}
                value={value}
                disabledDate={disabledDate}
            />
        );

    const children = [
      header,
      <div key="calendar-body" class={`${prefixCls}-calendar-body`}>
        {table}
      </div>
    ];

    const className = [`${prefixCls}-full`];

    if (fullscreen) {
      className.push(`${prefixCls}-fullscreen`);
    }

    return ctx.renderRoot({
      children,
      class: className.join(' ')
    });
  }
};

export default FullCalendar;
