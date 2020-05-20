import {useRootFocusBlur} from '@/tools/focus';
import {useLocalValue} from '@/tools/value';
import moment from 'moment';
import {setTimeout} from 'timers';
import {cloneVNode, getCurrentInstance, onBeforeUnmount, onMounted, onUpdated, ref} from 'vue';
import createChainedFunction from '../../_util/createChainedFunction';
import KeyCode from '../../_util/KeyCode';
import {getEvents, getOptionProps, getStyle} from '../../_util/props-util';
import PropTypes from '../../_util/vue-types';
import Trigger from '../../vc-trigger';
import placements from './picker/placements';

function isMoment(value) {
  if (Array.isArray(value)) {
    return (
      value.length === 0 || value.findIndex(val => val === undefined || moment.isMoment(val)) !== -1
    );
  } else {
    return value === undefined || moment.isMoment(value);
  }
}

const MomentType = PropTypes.custom(isMoment);
const Picker = {
  name: 'Picker',
  props: {
    animation: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
    disabled: PropTypes.bool,
    transitionName: PropTypes.string,
    format: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    // onChange: PropTypes.func,
    // onOpenChange: PropTypes.func,
    children: PropTypes.func,
    getCalendarContainer: PropTypes.func,
    calendar: PropTypes.any,
    open: PropTypes.bool,
    defaultOpen: PropTypes.bool.def(false),
    prefixCls: PropTypes.string.def('rc-calendar-picker'),
    placement: PropTypes.any.def('bottomLeft'),
    value: PropTypes.oneOfType([MomentType, PropTypes.arrayOf(MomentType)]),
    defaultValue: PropTypes.oneOfType([MomentType, PropTypes.arrayOf(MomentType)]),
    align: PropTypes.object.def(() => ({})),
    dropdownClassName: PropTypes.string,
    dateRender: PropTypes.func
  },
  setup(props, {emit}) {
    const {getValue: getOpen, setValue: setOpen} = useLocalValue(props.defaultOpen, 'open');
    const {getValue, setValue} = useLocalValue(props.defaultValue);
    const {focus: rootFocus} = useRootFocusBlur();
    const focus = () => {
      if (!getOpen()) {
        rootFocus();
      }
    };
    const onCalendarClear = () => {
      closeCalendar(focus);
    };
    const openCalendar = (callback?) => {
      setOpen(true, callback);
    };
    const closeCalendar = (callback?) => {
      setOpen(false, callback);
    };
    const onCalendarSelect = (value, cause: any = {}) => {
      setValue(value);
      const calendarProps = getOptionProps(props.calendar);
      if (
        cause.source === 'keyboard' ||
        cause.source === 'dateInputSelect' ||
        (!calendarProps.timePicker && cause.source !== 'dateInput') ||
        cause.source === 'todayButton'
      ) {
        closeCalendar(focus);
      }
      emit('change', value);
    };
    const onCalendarBlur = () => {
      setOpen(false);
    };
    const onCalendarKeyDown = (event) => {
      if (event.keyCode === KeyCode.ESC) {
        event.stopPropagation();
        closeCalendar(focus);
      }
    };
    const calendarInstance = ref(undefined);
    const focusCalendar = () => {
      if (getOpen() && calendarInstance.value && calendarInstance.value.componentInstance) {
        calendarInstance.value.componentInstance.focus();
      }
    };
    const onCalendarOk = () => {
      closeCalendar(focus);
    };
    const preOpen = ref(props.open);
    const focusTimeout = ref(undefined);
    onMounted(() => {
      preOpen.value = getOpen();
    });
    onUpdated(() => {
      if (!preOpen.value && getOpen()) {
        // setTimeout is for making sure saveCalendarRef happen before focusCalendar
        focusTimeout.value = setTimeout(focusCalendar, 0);
      }
      preOpen.value = getOpen();
    });
    onBeforeUnmount(() => {
      clearTimeout(focusTimeout.value);
    });
    return {
      getOpen,
      setOpen,
      getValue,
      setValue,
      onCalendarKeyDown,
      onCalendarSelect,
      setCalendarInstance(value) {
        calendarInstance.value = value;
      },
      onKeyDown(event) {
        if (!getOpen() && (event.keyCode === KeyCode.DOWN || event.keyCode === KeyCode.ENTER)) {
          openCalendar();
          event.preventDefault();
        }
      },
      onCalendarOk,
      onCalendarClear,
      onCalendarBlur,
      onVisibleChange(open) {
        setOpen(open);
      },
      getCalendarElement() {
        const calendarProps = props.calendar.props;
        const calendarEvents = getEvents(props.calendar);
        const defaultValue = getValue();
        const extraProps = {
          ref: 'calendarInstance',
          defaultValue: defaultValue || calendarProps.defaultValue,
          selectedValue: getValue(),
          onKeydown: onCalendarKeyDown,
          onOk: createChainedFunction(calendarEvents.ok, onCalendarOk),
          onSelect: createChainedFunction(calendarEvents.select, onCalendarSelect),
          onClear: createChainedFunction(calendarEvents.clear, onCalendarClear),
          onBlur: createChainedFunction(calendarEvents.blur, onCalendarBlur)
        };

        return cloneVNode(props.calendar, extraProps);
      },
      getCalendarInstance() {
        return calendarInstance.value;
      },
      openCalendar,
      closeCalendar,
      focusCalendar
    };
  },

  render(ctx) {
    const instance = getCurrentInstance();
    const style = getStyle(instance);
    const {
      prefixCls,
      placement,
      getCalendarContainer,
      align,
      animation,
      disabled,
      dropdownClassName,
      transitionName,
      getCalendarInstance
    } = ctx;
    const sOpen = ctx.getOpen();
    const children = this.$slots.default;
    const childrenState = {
      value: ctx.getValue(),
      open: sOpen
    };
    if (sOpen || !getCalendarInstance()) {
      ctx.setCalendarInstance(ctx.getCalendarElement());
    }
    const action = disabled && !sOpen ? [] : ['click']
    return (
      <Trigger
        popupAlign={align}
        builtinPlacements={placements}
        popupPlacement={placement}
        action={action}
        destroyPopupOnHide={true}
        getPopupContainer={getCalendarContainer}
        popupStyle={style}
        popupAnimation={animation}
        popupTransitionName={transitionName}
        popupVisible={sOpen}
        onPopupVisibleChange={this.onVisibleChange}
        prefixCls={prefixCls}
        popupClassName={dropdownClassName}>
        {
          // @ts-ignore
          <template slot="popup">{ctx.getCalendarInstance()}</template>
        }
        {cloneVNode(children(childrenState, ctx)[0], {onKeydown: this.onKeyDown})}
      </Trigger>
    );
  }
} as any;

export default Picker;
