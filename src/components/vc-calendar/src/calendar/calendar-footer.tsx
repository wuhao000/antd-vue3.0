import {defineComponent, getCurrentInstance} from 'vue';
import {getListenersFromInstance, getListenersFromProps, getOptionProps} from '../../../_util/props-util';
import PropTypes from '../../../_util/vue-types';
import OkButton from './ok-button';
import TimePickerButton from './time-picker-button';
import TodayButton from './today-button';

const CalendarFooter = defineComponent({
  name: 'CalendarFooter',
  props: {
    prefixCls: PropTypes.string,
    showDateInput: PropTypes.bool,
    disabledTime: PropTypes.any,
    timePicker: PropTypes.any,
    selectedValue: PropTypes.any,
    showOk: PropTypes.bool,
    // onSelect: PropTypes.func,
    value: PropTypes.object,
    renderFooter: PropTypes.func,
    defaultValue: PropTypes.object,
    locale: PropTypes.object,
    showToday: PropTypes.bool,
    disabledDate: PropTypes.func,
    showTimePicker: PropTypes.bool,
    okDisabled: PropTypes.bool,
    mode: PropTypes.string
  },
  methods: {
    onSelect(value) {
      const instance = getCurrentInstance();
      instance.emit('select', value);
    }
  },
  render(ctx) {
    const instance = getCurrentInstance();
    const props = getOptionProps(instance);
    const {value, prefixCls, showOk, timePicker, renderFooter, showToday, mode} = props;
    let footerEl = null;
    const extraFooter = renderFooter && renderFooter(mode);
    if (showToday || timePicker || extraFooter) {
      const btnProps = {
        ...props,
        value,
        ...getListenersFromInstance(instance)
      };
      let nowEl = null;
      if (showToday) {
        nowEl = <TodayButton key="todayButton" {...btnProps} />;
      }
      delete btnProps.value;
      let okBtn = null;
      if (showOk === true || (showOk !== false && !!timePicker)) {
        okBtn = <OkButton key="okButton" {...btnProps} />;
      }
      let timePickerBtn = null;
      if (timePicker) {
        timePickerBtn = <TimePickerButton key="timePickerButton" {...btnProps} />;
      }

      let footerBtn;
      if (nowEl || timePickerBtn || okBtn || extraFooter) {
        footerBtn = (
            <span class={`${prefixCls}-footer-btn`}>
              {extraFooter}
              {nowEl}
              {timePickerBtn}
              {okBtn}
            </span>
        );
      }
      const cls = {
        [`${prefixCls}-footer`]: true,
        [`${prefixCls}-footer-show-ok`]: !!okBtn
      };
      footerEl = <div class={cls}>{footerBtn}</div>;
    }
    return footerEl;
  }
}) as any;

export default CalendarFooter;
