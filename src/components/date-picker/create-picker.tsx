import input from '@/components/input/input';
import {useLocalValue} from '@/tools/value';
import classNames from 'classnames';
import omit from 'lodash/omit';
import * as moment from 'moment';
import {defineComponent, getCurrentInstance, nextTick, cloneVNode, ref, watch} from 'vue';
import interopDefault from '../_util/interopDefault';
import {
  getComponentFromProp,
  getListenersFromProps,
  getListenersFromInstance,
  initDefaultProps,
  isValidElement,
  mergeProps
} from '../_util/props-util';
import {cloneElement} from '../_util/vnode';
import {useConfigProvider} from '../config-provider';
import Icon from '../icon';
import MonthCalendar from '../vc-calendar/src/month-calendar';
import VcDatePicker from '../vc-calendar/src/picker';
import {formatDate} from './utils';

// export const PickerProps = {
//   value?: moment.Moment;
//   prefixCls: string;
// }
function noop() {
}

export default function createPicker(TheCalendar, propsDef) {
  return defineComponent({
    props: initDefaultProps(propsDef, {
      allowClear: true,
      showToday: true
    }),
    setup(props, {emit}) {
      const {getValue, setValue, context: valueContext} = useLocalValue(props.value);
      const {value: localOpen, getValue: getOpen, context: openContext, setValue: setOpen} = useLocalValue(props.open, 'open');
      const showDate = ref(getValue());
      valueContext.doAfterSetValue = (val) => {
        showDate.value = val;
      };
      openContext.doAfterSetValue = (val) => {
        if (!val && getValue() !== showDate.value) {
          showDate.value = getValue();
        }
      };
      if (getValue() && !interopDefault(moment).isMoment(getValue())) {
        throw new Error(
          'The value/defaultValue of DatePicker or MonthPicker must be ' + 'a moment object'
        );
      }
      const handleCalendarChange = (value) => {
        showDate.value = value;
      };
      const handleChange = (value) => {
        setValue(value, 'change');
        showDate.value = value;
        // this.$emit('change', value, formatDate(value, this.format));
      };
      const handleOpenChange = (open) => {
        setOpen(open);
      };
      const instance = getCurrentInstance();
      const renderFooter = (...args) => {
        const renderExtraFooter = getComponentFromProp(instance, 'renderExtraFooter');
        return renderExtraFooter ? (
          <div class={`${props.prefixCls}-footer-extra`}>
            {typeof renderExtraFooter === 'function'
              ? renderExtraFooter(...args)
              : renderExtraFooter}
          </div>
        ) : null;
      };
      const clearSelection = (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleChange(null);
      };
      watch(() => localOpen.value, (val, oldVal) => {
        nextTick(() => {
          if (props.open === undefined && oldVal && !val) {
            focus();
          }
        });
      });
      const inputRef = ref(undefined);
      return {
        showDate, getValue, setValue, getOpen, setOpen,
        clearSelection, handleCalendarChange,
        handleOpenChange, renderFooter,
        configProvider: useConfigProvider(),
        onMouseEnter(e) {
          emit('mouseenter', e);
        },
        onMouseLeave(e) {
          emit('mouseleave', e);
        },
        setInputRef: (el) => {
          inputRef.value = el;
        },
        focus() {
          inputRef.value.focus();
        },
        blur() {
          inputRef.value.blur();
        }
      };
    },
    render(ctx) {
      const props = this.$props;
      const instance = getCurrentInstance();
      const value = ctx.getValue();
      const showDate = ctx.showDate;
      const open = ctx.getOpen();
      let suffixIcon = getComponentFromProp(instance, 'suffixIcon');
      suffixIcon = Array.isArray(suffixIcon) ? suffixIcon[0] : suffixIcon;
      const listeners = getListenersFromInstance(instance);
      const {panelChange = noop, focus = noop, blur = noop, ok = noop} = listeners;
      const {prefixCls: customizePrefixCls, locale, localeCode, inputReadOnly} = ctx;
      const getPrefixCls = ctx.configProvider.getPrefixCls;
      const prefixCls = getPrefixCls('calendar', customizePrefixCls);
      const dateRender = getComponentFromProp(instance, 'dateRender');
      const monthCellContentRender =
        getComponentFromProp(instance, 'monthCellContentRender');
      const placeholder = 'placeholder' in props ? props.placeholder : locale.lang.placeholder;

      const disabledTime = props.showTime ? props.disabledTime : null;

      const calendarClassName = classNames({
        [`${prefixCls}-time`]: props.showTime,
        [`${prefixCls}-month`]: MonthCalendar === TheCalendar
      });

      if (value && localeCode) {
        value.locale(localeCode);
      }

      const pickerProps: any = {};
      const calendarProps: any = {};
      const pickerStyle: any = {};
      if (props.showTime) {
        // fix https://github.com/ant-design/ant-design/issues/1902
        calendarProps.onSelect = ctx.handleChange;
        pickerStyle.minWidth = '195px';
      } else {
        pickerProps.onChange = ctx.handleChange;
      }
      if ('mode' in props) {
        calendarProps.mode = props.mode;
      }
      const theCalendarProps = mergeProps(calendarProps, {
        disabledDate: props.disabledDate,
        disabledTime,
        locale: locale.lang,
        timePicker: props.timePicker,
        defaultValue: props.defaultPickerValue || interopDefault(moment)(),
        dateInputPlaceholder: placeholder,
        prefixCls,
        dateRender,
        format: props.format,
        showToday: props.showToday,
        monthCellContentRender,
        renderFooter: this.renderFooter,
        value: showDate,
        inputReadOnly,
        onOk: ok,
        onPanelChange: panelChange,
        onChange: ctx.handleCalendarChange,
        class: calendarClassName
      });
      const calendar = <TheCalendar {...theCalendarProps} />;
      const clearIcon =
        !props.disabled && props.allowClear && value ? (
          <Icon
            type="close-circle"
            class={`${prefixCls}-picker-clear`}
            onClick={this.clearSelection}
            theme="filled"
          />
        ) : null;

      const inputIcon = (suffixIcon &&
        (isValidElement(suffixIcon) ? (
          cloneVNode(suffixIcon, {
            class: `${prefixCls}-picker-icon`
          })
        ) : (
          <span class={`${prefixCls}-picker-icon`}>{suffixIcon}</span>
        ))) || <Icon type="calendar" class={`${prefixCls}-picker-icon`}/>;

      const input = ({value: inputValue}) => {
        return (
          <div>
            <input
              ref="input"
              disabled={props.disabled}
              onFocus={focus}
              onBlur={blur}
              readonly={true}
              value={formatDate(inputValue, this.format)}
              placeholder={placeholder}
              class={props.pickerInputClass}
              tabindex={props.tabIndex}
              name={this.name}
            />
            {clearIcon}
            {inputIcon}
          </div>
        );
      };
      const vcDatePickerProps = {
        ...props,
        ...pickerProps,
        calendar,
        value,
        prefixCls: `${prefixCls}-picker-container`,
        ...omit(listeners, 'change'),
        onOpen: open,
        onOpenChange: this.handleOpenChange,
        style: props.popupStyle
      };
      return (
        <span
          class={props.pickerClass}
          style={pickerStyle}
          tabindex={props.disabled ? -1 : 0}
          onFocus={focus}
          onBlur={blur}
          onMouseenter={this.onMouseEnter}
          onMouseleave={this.onMouseLeave}>
          <VcDatePicker
            slots={{...this.$slots, default: input}}
            {...vcDatePickerProps}/>
        </span>
      );
    }
  });
}
