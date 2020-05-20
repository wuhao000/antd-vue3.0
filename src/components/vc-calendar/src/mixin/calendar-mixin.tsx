import {useLocalValue} from '@/tools/value';
import moment from 'moment';
import BaseMixin from '../../../_util/base-mixin';
import PropTypes from '../../../_util/vue-types';
import {getTodayTime, isAllowedDate} from '../util/index';

function noop() {
}

export function getNowByCurrentStateValue(value?) {
  let ret;
  if (value) {
    ret = getTodayTime(value);
  } else {
    ret = moment();
  }
  return ret;
}

function isMoment(value) {
  if (Array.isArray(value)) {
    return (
        value.length === 0 || value.findIndex(val => val === undefined || moment.isMoment(val)) !== -1
    );
  } else {
    return value === undefined || moment.isMoment(value);
  }
}

export const useCalendarMixin = (props, emit, {
  onKeyDown, onBlur
}: { onKeyDown: (...args: any[]) => any, onBlur?: (...args: any[]) => any }) => {
  const {value: sValue, setValue: setLocalValue} = useLocalValue(props.defaultValue || getNowByCurrentStateValue());
  const {value: sSelectedValue, setValue: setLocalSelectedValue} = useLocalValue(props.defaultSelectedValue, 'selectedValue');
  const setValue = (value) => {
    const originalValue = sValue.value;
    setLocalValue(value);
    if (
        (originalValue && value && !originalValue.isSame(value)) ||
        (!originalValue && value) ||
        (originalValue && !value)
    ) {
      emit('change', value);
    }
  };
  const setSelectedValue = (selectedValue, cause) => {
    setLocalSelectedValue(selectedValue);
    emit('select', selectedValue, cause);
  };
  return {
    sValue,
    sSelectedValue,
    setValue,
    setSelectedValue,
    onSelect(value, cause?) {
      if (value) {
        setValue(value);
      }
      setSelectedValue(value, cause);
    },
    renderRoot(newProps) {
      const prefixCls = props.prefixCls;
      const className = {
        [prefixCls]: 1,
        [`${prefixCls}-hidden`]: !props.visible,
        // [props.className]: !!props.className,
        [newProps.class]: !!newProps.class
      };
      return (
          <div
              ref="rootInstance"
              class={className}
              tabindex={0}
              onKeydown={onKeyDown || noop}
              onBlur={onBlur || noop}
          >
            {newProps.children}
          </div>
      );
    },
    isAllowedDate(value) {
      const disabledDate = props.disabledDate;
      const disabledTime = props.disabledTime;
      return isAllowedDate(value, disabledDate, disabledTime);
    }
  };
};

const MomentType = PropTypes.custom(isMoment);
const CalendarMixin = {
  mixins: [BaseMixin],
  name: 'CalendarMixinWrapper',
  props: {
    value: MomentType,
    defaultValue: MomentType
  }
};
export default CalendarMixin;
