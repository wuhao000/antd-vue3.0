import {KeyName} from '@/components/_util/keycode';
import {useLocalValue} from '@/tools/value';
import classNames from 'classnames';
import moment from 'moment';
import {defineComponent, getCurrentInstance, nextTick, onMounted, ref} from 'vue';
import {getComponentFromProp, getListenersFromVNode, initDefaultProps, isValidElement} from '../_util/props-util';
import {cloneElement} from '../_util/vnode';
import PropTypes from '../_util/vue-types';
import Trigger from '../vc-trigger';
import Panel from './panel';
import placements from './placements';

function noop() {
  return () => {
  };
}

export default defineComponent({
  name: 'VcTimePicker',
  props: initDefaultProps(
      {
        prefixCls: PropTypes.string,
        clearText: PropTypes.string,
        value: PropTypes.any,
        defaultOpenValue: {
          type: Object,
          default: () => {
            return moment();
          }
        },
        inputReadOnly: PropTypes.bool,
        disabled: PropTypes.bool,
        allowEmpty: PropTypes.bool,
        defaultValue: PropTypes.any,
        open: PropTypes.bool,
        defaultOpen: PropTypes.bool,
        align: PropTypes.object,
        placement: PropTypes.any,
        transitionName: PropTypes.string,
        getPopupContainer: PropTypes.func,
        placeholder: PropTypes.string,
        format: PropTypes.string,
        showHour: PropTypes.bool,
        showMinute: PropTypes.bool,
        showSecond: PropTypes.bool,
        popupClassName: PropTypes.string,
        popupStyle: PropTypes.object,
        disabledHours: PropTypes.func,
        disabledMinutes: PropTypes.func,
        disabledSeconds: PropTypes.func,
        hideDisabledOptions: PropTypes.bool,
        // onChange: PropTypes.func,
        // onAmPmChange: PropTypes.func,
        // onOpen: PropTypes.func,
        // onClose: PropTypes.func,
        // onFocus: PropTypes.func,
        // onBlur: PropTypes.func,
        name: PropTypes.string,
        autoComplete: PropTypes.string,
        use12Hours: PropTypes.bool,
        hourStep: PropTypes.number,
        minuteStep: PropTypes.number,
        secondStep: PropTypes.number,
        focusOnOpen: PropTypes.bool,
        // onKeyDown: PropTypes.func,
        autoFocus: PropTypes.bool,
        id: PropTypes.string,
        inputIcon: PropTypes.any,
        clearIcon: PropTypes.any,
        addon: PropTypes.func
      },
      {
        clearText: 'clear',
        prefixCls: 'rc-time-picker',
        defaultOpen: false,
        inputReadOnly: false,
        popupClassName: '',
        popupStyle: {},
        align: {},
        allowEmpty: true,
        showHour: true,
        showMinute: true,
        showSecond: true,
        disabledHours: noop,
        disabledMinutes: noop,
        disabledSeconds: noop,
        hideDisabledOptions: false,
        placement: 'bottomLeft',
        use12Hours: false,
        focusOnOpen: false
      }
  ),
  setup(props, {emit}) {
    const instance = getCurrentInstance();
    const {value: sValue, setValue: setLocalValue} = useLocalValue(props.defaultValue);
    const {value: sOpen, setValue: setLocalOpen} = useLocalValue(props.defaultOpen, 'open');
    const panelRef = ref(undefined);
    const pickerRef = ref(undefined);
    const setPanel = (el) => {
      panelRef.value = el;
    };
    const onEsc = () => {
      setOpen(false);
      focus();
    };
    const setPicker = (el) => {
      pickerRef.value = el;
    };
    const focus = () => {
      pickerRef.value.focus();
    };
    const setOpen = (open) => {
      if (sOpen.value !== open) {
        setLocalOpen(open);
        if (open) {
          emit('open', {open});
        } else {
          emit('close', {open});
        }
      }
    };
    const setValue = (value) => {
      setLocalValue(value);
      emit('change', value);
    };
    const onClear = (event) => {
      event.stopPropagation();
      setValue(null);
      setOpen(false);
    };
    const onPanelChange = (value) => {
      setValue(value);
    };
    const renderClearButton = () => {
      const {prefixCls, allowEmpty, clearText, disabled} = props;
      if (!allowEmpty || !sValue.value || disabled) {
        return null;
      }
      const clearIcon = getComponentFromProp(instance, 'clearIcon');
      if (isValidElement(clearIcon)) {
        const {onClick} = getListenersFromVNode(clearIcon) || {};
        return cloneElement(clearIcon, {
          onClick: (...args) => {
            if (onClick) {
              onClick(...args);
            }
            onClear(args[0]);
          }
        });
      }

      return (
          <a role="button"
             class={`${prefixCls}-clear`}
             title={clearText}
             onClick={onClear}
             tabindex={0}>
            {clearIcon || <i class={`${prefixCls}-clear-icon`}/>}
          </a>
      );
    };
    const getFormat = () => {
      const {format, showHour, showMinute, showSecond, use12Hours} = props;
      if (format) {
        return format;
      }

      if (use12Hours) {
        const fmtString = [showHour ? 'h' : '', showMinute ? 'mm' : '', showSecond ? 'ss' : '']
            .filter(item => !!item)
            .join(':');

        return fmtString.concat(' a');
      }

      return [showHour ? 'HH' : '', showMinute ? 'mm' : '', showSecond ? 'ss' : '']
          .filter(item => !!item)
          .join(':');
    };
    const getPanelElement = () => {
      const {
        prefixCls,
        placeholder,
        disabledHours,
        addon,
        disabledMinutes,
        disabledSeconds,
        hideDisabledOptions,
        inputReadOnly,
        showHour,
        showMinute,
        showSecond,
        defaultOpenValue,
        clearText,
        use12Hours,
        focusOnOpen,
        hourStep,
        minuteStep,
        secondStep
      } = props;
      const clearIcon = getComponentFromProp(instance, 'clearIcon');
      return (
          <Panel
              clearText={clearText}
              prefixCls={`${prefixCls}-panel`}
              ref={setPanel}
              value={sValue}
              inputReadOnly={inputReadOnly}
              onChange={onPanelChange}
              onAmPmChange={onAmPmChange}
              defaultOpenValue={defaultOpenValue}
              showHour={showHour}
              showMinute={showMinute}
              showSecond={showSecond}
              onEsc={onEsc}
              format={getFormat()}
              placeholder={placeholder}
              disabledHours={disabledHours}
              disabledMinutes={disabledMinutes}
              disabledSeconds={disabledSeconds}
              hideDisabledOptions={hideDisabledOptions}
              use12Hours={use12Hours}
              hourStep={hourStep}
              minuteStep={minuteStep}
              secondStep={secondStep}
              focusOnOpen={focusOnOpen}
              onKeydown={onKeyDown2}
              clearIcon={clearIcon}
              addon={addon}
          />
      );
    };
    const onFocus = (e) => {
      emit('focus', e);
    };
    const onAmPmChange = (ampm) => {
      emit('amPmChange', ampm);
    };
    const onBlur = (e) => {
      emit('blur', e);
    };
    const onKeyDown = (e) => {
      if (e.key === KeyName.Down) {
        setOpen(true);
      }
    };
    const getPopupClassName = () => {
      const {showHour, showMinute, showSecond, use12Hours, prefixCls, popupClassName} = props;

      let selectColumnCount = 0;
      if (showHour) {
        selectColumnCount += 1;
      }
      if (showMinute) {
        selectColumnCount += 1;
      }
      if (showSecond) {
        selectColumnCount += 1;
      }
      if (use12Hours) {
        selectColumnCount += 1;
      }
      // Keep it for old compatibility
      return classNames(
          popupClassName,
          {
            [`${prefixCls}-panel-narrow`]: (!showHour || !showMinute || !showSecond) && !use12Hours
          },
          `${prefixCls}-panel-column-${selectColumnCount}`
      );
    };
    const onKeyDown2 = (e) => {
      emit('keydown', e);
    };
    const blur = () => {
      pickerRef.value.blur();
    };
    const onVisibleChange = (open) => {
      setOpen(open);
    };
    onMounted(() => {
      nextTick(() => {
        if (props.autoFocus) {
          focus();
        }
      });
    });
    return {
      sValue,
      onFocus,
      blur,
      focus,
      onBlur,
      sOpen,
      onVisibleChange,
      getPanelElement,
      renderClearButton,
      onKeyDown,
      getFormat,
      getPopupClassName,
      setPicker
    };
  },
  render(ctx) {
    const instance = getCurrentInstance();
    const {
      prefixCls,
      placeholder,
      placement,
      align,
      id,
      disabled,
      transitionName,
      getPopupContainer,
      name,
      autoComplete,
      autoFocus,
      inputReadOnly,
      sOpen,
      sValue,
      onFocus,
      onBlur,
      popupStyle
    } = ctx;
    const popupClassName = ctx.getPopupClassName();
    const inputIcon = getComponentFromProp(instance, 'inputIcon');
    const clearButton = ctx.renderClearButton();
    return (
        <Trigger
            prefixCls={`${prefixCls}-panel`}
            popupClassName={popupClassName}
            popupStyle={popupStyle}
            popupAlign={align}
            builtinPlacements={placements}
            popupPlacement={placement}
            action={disabled ? [] : ['click']}
            destroyPopupOnHide={true}
            getPopupContainer={getPopupContainer}
            popupTransitionName={transitionName}
            popupVisible={sOpen}
            onPopupVisibleChange={ctx.onVisibleChange}>
          <template slot="popup">{ctx.getPanelElement()}</template>
          <span class={`${prefixCls}`}>
            <input
                class={`${prefixCls}-input`}
                ref={this.setPicker}
                type="text"
                placeholder={placeholder}
                name={name}
                onKeydown={ctx.onKeyDown}
                disabled={disabled}
                value={(sValue && sValue.format(ctx.getFormat())) || ''}
                autocomplete={autoComplete}
                onFocus={onFocus}
                onBlur={onBlur}
                autofocus={autoFocus}
                readonly={!!inputReadOnly}
                id={id}
            />
            {inputIcon || <span class={`${prefixCls}-icon`}/>}
            {clearButton}
          </span>
        </Trigger>
    );
  }
});
