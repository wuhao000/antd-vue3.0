// based on rc-input-number 4.5.5
import classNames from 'classnames';
import {defineComponent, getCurrentInstance, nextTick, onBeforeUnmount, onMounted, onUpdated, ref} from 'vue';
import KeyCode, {KeyName} from '../../_util/keycode';
import {getListenersFromInstance, initDefaultProps} from '../../_util/props-util';
import PropTypes from '../../_util/vue-types';
import InputHandler from './input-handler';

function noop() {
}

function preventDefault(e) {
  e.preventDefault();
}

function defaultParser(input) {
  return input.replace(/[^\w\.-]+/g, '');
}

/**
 * When click and hold on a button - the speed of auto changin the value.
 */
const SPEED = 200;

/**
 * When click and hold on a button - the delay before auto changin the value.
 */
const DELAY = 600;

/**
 * Max Safe Integer -- on IE this is not available, so manually set the number in that case.
 * The reason this is used, instead of Infinity is because numbers above the MSI are unstable
 */
const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || Math.pow(2, 53) - 1;

const isValidProps = value => value !== undefined && value !== null;

const isEqual = (oldValue, newValue) =>
    newValue === oldValue ||
    (typeof newValue === 'number' &&
        typeof oldValue === 'number' &&
        isNaN(newValue) &&
        isNaN(oldValue));

const inputNumberProps = {
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  defaultValue: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  focusOnUpDown: PropTypes.bool,
  autoFocus: PropTypes.bool,
  // onChange: PropTypes.func,
  // onKeyDown: PropTypes.func,
  // onKeyUp: PropTypes.func,
  prefixCls: PropTypes.string,
  tabIndex: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  // onFocus: PropTypes.func,
  // onBlur: PropTypes.func,
  readOnly: PropTypes.bool,
  max: PropTypes.number,
  min: PropTypes.number,
  step: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  upHandler: PropTypes.any,
  downHandler: PropTypes.any,
  useTouch: PropTypes.bool,
  formatter: PropTypes.func,
  parser: PropTypes.func,
  // onMouseEnter: PropTypes.func,
  // onMouseLeave: PropTypes.func,
  // onMouseOver: PropTypes.func,
  // onMouseOut: PropTypes.func,
  precision: PropTypes.number,
  required: PropTypes.bool,
  pattern: PropTypes.string,
  decimalSeparator: PropTypes.string,
  autoComplete: PropTypes.string,
  title: PropTypes.string,
  name: PropTypes.string,
  id: PropTypes.string
};

export default defineComponent({
  name: 'VCInputNumber',
  inheritAttrs: false,
  props: initDefaultProps(inputNumberProps, {
    focusOnUpDown: true,
    useTouch: false,
    prefixCls: 'rc-input-number',
    min: -MAX_SAFE_INTEGER,
    step: 1,
    parser: () => defaultParser,
    required: false,
    autoComplete: 'off'
  }),
  setup(props, {emit, attrs}) {
    const focused = ref(props.autoFocus);
    const prevProps = ref({...props});
    const cursorStart = ref(undefined);
    const cursorEnd = ref(null);
    const pressingUpOrDown = ref(false);
    const cursorBefore = ref(null);
    const cursorAfter = ref(null);
    const currentValue = ref(null);
    const lastKeyCode = ref(null);
    const inputting = ref(false);
    const isNotCompleteNumber = (num) => {
      return (
          isNaN(num) ||
          num === '' ||
          num === null ||
          (num && num.toString().indexOf('.') === num.toString().length - 1)
      );
    };
    const toNumber = (num) => {
      const {precision, autoFocus} = props;
      const sFocus = focused.value !== undefined ? focused.value : autoFocus;
      // num.length > 16 => This is to prevent input of large numbers
      const numberIsTooLarge = num && num.length > 16 && sFocus;
      if (isNotCompleteNumber(num) || numberIsTooLarge) {
        return num;
      }
      if (isValidProps(precision)) {
        return Math.round(num * Math.pow(10, precision)) / Math.pow(10, precision);
      }
      return Number(num);
    };
    const getValidValue = (value, min = props.min, max = props.max) => {
      let val = parseFloat(value);
      // https://github.com/ant-design/ant-design/issues/7358
      if (isNaN(val)) {
        return value;
      }
      if (val < min) {
        val = min;
      }
      if (val > max) {
        val = max;
      }
      return val;
    };
    const getPrecisionFactor = (currentValue, ratio = 1) => {
      const precision = getMaxPrecision(currentValue, ratio);
      return Math.pow(10, precision);
    };
    const upStep = (val, rat) => {
      const {step} = props;
      const precisionFactor = getPrecisionFactor(val, rat);
      const precision = Math.abs(getMaxPrecision(val, rat));
      const result = (
          (precisionFactor * val + precisionFactor * step * rat) /
          precisionFactor
      ).toFixed(precision);
      return toNumber(result);
    };
    const downStep = (val, rat) => {
      const {step} = props;
      const precisionFactor = getPrecisionFactor(val, rat);
      const precision = Math.abs(getMaxPrecision(val, rat));
      const result = (
          (precisionFactor * val - precisionFactor * step * rat) /
          precisionFactor
      ).toFixed(precision);
      return toNumber(result);
    };
    const sValue = ref((() => {
      let value;
      if ('value' in props) {
        value = props.value;
      } else {
        value = props.defaultValue;
      }
      return getValidValue(toNumber(value));
    })());
    const getPrecision = (value) => {
      if (isValidProps(props.precision)) {
        return props.precision;
      }
      const valueString = value.toString();
      if (valueString.indexOf('e-') >= 0) {
        return parseInt(valueString.slice(valueString.indexOf('e-') + 2), 10);
      }
      let precision = 0;
      if (valueString.indexOf('.') >= 0) {
        precision = valueString.length - valueString.indexOf('.') - 1;
      }
      return precision;
    };
    const getMaxPrecision = (currentValue, ratio = 1) => {
      if (isValidProps(props.precision)) {
        return props.precision;
      }
      const {step} = props;
      const ratioPrecision = getPrecision(ratio);
      const stepPrecision = getPrecision(step);
      const currentValuePrecision = getPrecision(currentValue);
      if (!currentValue) {
        return ratioPrecision + stepPrecision;
      }
      return Math.max(currentValuePrecision, ratioPrecision + stepPrecision);
    };
    const toPrecisionAsStep = (num) => {
      if (isNotCompleteNumber(num) || num === '') {
        return num;
      }
      const precision = Math.abs(getMaxPrecision(num));
      if (!isNaN(precision)) {
        return Number(num).toFixed(precision);
      }
      return num.toString();
    };
    const inputValue = ref(toPrecisionAsStep(sValue.value));

    const updatedFunc = () => {
      const inputElem = inputRef.value;
      // Restore cursor
      try {
        // Firefox set the input cursor after it get focused.
        // This caused that if an input didn't init with the selection,
        // set will cause cursor not correct when first focus.
        // Safari will focus input if set selection. We need skip this.
        if (cursorStart.value !== undefined && focused.value) {
          // In most cases, the string after cursor is stable.
          // We can move the cursor before it

          if (
              // If not match full str, try to match part of str
              !partRestoreByAfter(cursorAfter.value) &&
              sValue.value !== props.value
          ) {
            // If not match any of then, let's just keep the position
            // TODO: Logic should not reach here, need check if happens
            let pos = cursorStart.value + 1;

            // If not have last string, just position to the end
            if (!cursorAfter.value) {
              pos = inputElem.value.length;
            } else if (lastKeyCode.value === KeyCode.BACKSPACE) {
              pos = cursorStart.value - 1;
            } else if (lastKeyCode.value === KeyCode.DELETE) {
              pos = cursorStart.value;
            }
            fixCaret(pos, pos);
          } else if (currentValue.value === inputElem.value) {
            // Handle some special key code
            switch (lastKeyCode.value) {
              case KeyCode.BACKSPACE:
                fixCaret(cursorStart.value - 1, cursorStart.value - 1);
                break;
              case KeyCode.DELETE:
                fixCaret(cursorStart.value + 1, cursorStart.value + 1);
                break;
              default:
                // Do nothing
            }
          }
        }
      } catch (e) {
        // Do nothing
      }
      // Reset last key
      lastKeyCode.value = null;

      // pressingUpOrDown is true means that someone just click up or down button
      if (!pressingUpOrDown.value) {
        return;
      }
      if (props.focusOnUpDown && focused.value) {
        if (document.activeElement !== inputElem) {
          focus();
        }
      }

      pressingUpOrDown.value = false;
    };
    const onKeyDown = (e, ...args) => {
      if (e.key === KeyName.Up) {
        const ratio = getRatio(e);
        onUp(e, ratio);
        stop();
      } else if (e.key === KeyName.Down) {
        const ratio = getRatio(e);
        onDown(e, ratio);
        stop();
      } else if (e.key === KeyName.Enter) {
        emit('pressEnter', e);
      }
      // Trigger user key down
      recordCursorPosition();
      lastKeyCode.value = e.keyCode;
      emit('keydown', e, ...args);
    };
    const onKeyUp = (e, ...args) => {
      stop();
      recordCursorPosition();
      emit('keyup', e, ...args);
    };
    const rawInput = ref(null);
    const onChange = (e) => {
      if (focused.value) {
        inputting.value = true;
      }
      rawInput.value = props.parser(getValueFromEvent(e));
      inputValue.value = rawInput.value;
      emit('change', toNumber(rawInput.value)); // valid number or invalid string
    };
    const onFocus = (...args) => {
      focused.value = true;
      emit('focus', ...args);
    };
    const onBlur = (...args) => {
      inputting.value = false;
      focused.value = false;
      const value = getCurrentValidValue(inputValue.value);
      const newValue = setValue(value);
      if (attrs.onBlur) {
        const originValue = inputRef.value.value;
        inputRef.value.value = getInputDisplayValue({focused: false, sValue: newValue});
        emit('blur', ...args);
        inputRef.value.value = originValue;
      }
    };
    const getCurrentValidValue = (value) => {
      let val = value;
      if (val === '') {
        val = '';
      } else if (!isNotCompleteNumber(parseFloat(val))) {
        val = getValidValue(val);
      } else {
        val = sValue.value;
      }
      return toNumber(val);
    };
    const getRatio = (e) => {
      let ratio = 1;
      if (e.metaKey || e.ctrlKey) {
        ratio = 0.1;
      } else if (e.shiftKey) {
        ratio = 10;
      }
      return ratio;
    };
    const getValueFromEvent = (e) => {
      // optimize for chinese input expierence
      // https://github.com/ant-design/ant-design/issues/8196
      let value = e.target.value.trim().replace(/。/g, '.');

      if (isValidProps(props.decimalSeparator)) {
        value = value.replace(props.decimalSeparator, '.');
      }

      return value;
    };
    const setValue = (v, callback?) => {
      // trigger onChange
      const {precision} = props;
      const newValue = isNotCompleteNumber(parseFloat(v)) ? null : parseFloat(v);
      // https://github.com/ant-design/ant-design/issues/7363
      // https://github.com/ant-design/ant-design/issues/16622
      const newValueInString =
          typeof newValue === 'number' ? newValue.toFixed(precision) : `${newValue}`;
      const changed = newValue !== sValue.value || newValueInString !== `${inputValue.value}`;
      if (props.value === undefined) {
        sValue.value = newValue;
        inputValue.value = toPrecisionAsStep(v);
        callback?.();
      } else {
        // always set input value same as value
        inputValue.value = toPrecisionAsStep(sValue.value);
        callback?.();
      }
      if (changed) {
        emit('change', newValue);
      }
      return newValue;
    };
    const getInputDisplayValue = (state: { focused: boolean, sValue: string | number }) => {
      const sFocused = state ? state.focused : focused.value;
      const v = state ? state.sValue : sValue.value;
      let inputDisplayValue;
      if (sFocused) {
        inputDisplayValue = inputValue.value;
      } else {
        inputDisplayValue = toPrecisionAsStep(v);
      }

      if (inputDisplayValue === undefined || inputDisplayValue === null) {
        inputDisplayValue = '';
      }

      let inputDisplayValueFormat = formatWrapper(inputDisplayValue);
      if (isValidProps(props.decimalSeparator)) {
        inputDisplayValueFormat = inputDisplayValueFormat
            .toString()
            .replace('.', props.decimalSeparator);
      }

      return inputDisplayValueFormat;
    };
    const recordCursorPosition = () => {
      // Record position
      try {
        const inputElem = inputRef.value;
        cursorStart.value = inputElem.selectionStart;
        cursorEnd.value = inputElem.selectionEnd;
        currentValue.value = inputElem.value;
        cursorBefore.value = inputElem.value.substring(0, cursorStart.value);
        cursorAfter.value = inputElem.value.substring(cursorEnd.value);
      } catch (e) {
        // Fix error in Chrome:
        // Failed to read the 'selectionStart' property from 'HTMLInputElement'
        // http://stackoverflow.com/q/21177489/3040605
      }
    };
    const fixCaret = (start, end) => {
      if (
          start === undefined ||
          end === undefined ||
          !inputRef.value ||
          !inputRef.value.value
      ) {
        return;
      }
      try {
        const inputElem = inputRef.value;
        const currentStart = inputElem.selectionStart;
        const currentEnd = inputElem.selectionEnd;

        if (start !== currentStart || end !== currentEnd) {
          inputElem.setSelectionRange(start, end);
        }
      } catch (e) {
        // Fix error in Chrome:
        // Failed to read the 'selectionStart' property from 'HTMLInputElement'
        // http://stackoverflow.com/q/21177489/3040605
      }
    };
    const restoreByAfter = (str) => {
      if (str === undefined) {
        return false;
      }

      const fullStr = inputRef.value.value;
      const index = fullStr.lastIndexOf(str);

      if (index === -1) {
        return false;
      }

      const prevCursorPos = cursorBefore.value.length;
      if (
          lastKeyCode.value === KeyCode.DELETE &&
          cursorBefore.value.charAt(prevCursorPos - 1) === str[0]
      ) {
        fixCaret(prevCursorPos, prevCursorPos);
        return true;
      }
      if (index + str.length === fullStr.length) {
        fixCaret(index, index);

        return true;
      }
      return false;
    };
    const partRestoreByAfter = (str) => {
      if (str === undefined) {
        return false;
      }

      // For loop from full str to the str with last char to map. e.g. 123
      // -> 123
      // -> 23
      // -> 3
      return Array.prototype.some.call(str, (_, start) => {
        const partStr = str.substring(start);

        return restoreByAfter(partStr);
      });
    };
    const formatWrapper = (num) => {
      // http://2ality.com/2012/03/signedzero.html
      // https://github.com/ant-design/ant-design/issues/9439
      if (props.formatter) {
        return props.formatter(num);
      }
      return num;
    };
    const autoStepTimer = ref(null);
    const stepFn = (type, e, ratio = 1, recursive) => {
      stop();
      if (e) {
        // e.persist()
        e.preventDefault();
      }
      if (props.disabled) {
        return;
      }
      const {max, min} = props;
      const value = getCurrentValidValue(inputValue.value) || 0;
      if (isNotCompleteNumber(value)) {
        return;
      }
      let val = null;
      if (type === 'up') {
        val = upStep(value, ratio);
      } else if (type === 'down') {
        val = downStep(value, ratio);
      }
      const outOfRange = val > max || val < min;
      if (val > max) {
        val = max;
      } else if (val < min) {
        val = min;
      }
      setValue(val);
      focused.value = true;
      if (outOfRange) {
        return;
      }
      autoStepTimer.value = setTimeout(
          () => {
            if (type === 'up') {
              onUp(e, ratio, true);
            } else if (type === 'down') {
              onDown(e, ratio, true);
            }
          },
          recursive ? SPEED : DELAY
      );
    };
    const stop = () => {
      if (autoStepTimer.value) {
        clearTimeout(autoStepTimer.value);
      }
    };
    const onDown = (e, ratio?, recursive?) => {
      pressingUpOrDown.value = true;
      stepFn('down', e, ratio, recursive);
    };
    const onUp = (e, ratio?, recursive?) => {
      pressingUpOrDown.value = true;
      stepFn('up', e, ratio, recursive);
    };
    const handleInputClick = () => {
      emit('click');
    };
    const inputRef = ref(null);
    const focus = () => {
      inputRef.value.focus();
      recordCursorPosition();
    };
    const blur = () => {
      inputRef.value.blur();
    };
    onMounted(() => {
      nextTick(() => {
        if (props.autoFocus && !props.disabled) {
          focus();
        }
        updatedFunc();
      });
    });
    onUpdated(() => {
      const {value, max, min} = props;
      const unwrapPrevProps = prevProps.value;
      // Don't trigger in componentDidMount
      if (unwrapPrevProps) {
        if (
            !isEqual(unwrapPrevProps.value, value) ||
            !isEqual(unwrapPrevProps.max, max) ||
            !isEqual(unwrapPrevProps.min, min)
        ) {
          const validValue = focused.value ? value : getValidValue(value);
          let nextInputValue;
          if (pressingUpOrDown.value) {
            nextInputValue = validValue;
          } else if (inputting.value) {
            nextInputValue = rawInput.value;
          } else {
            nextInputValue = toPrecisionAsStep(validValue);
          }
          sValue.value = validValue;
          inputValue.value = nextInputValue;
        }

        // Trigger onChange when max or min change
        // https://github.com/ant-design/ant-design/issues/11574
        const nextValue = 'value' in props ? value : sValue.value;
        // ref: null < 20 === true
        // https://github.com/ant-design/ant-design/issues/14277
        if (
            'max' in props &&
            unwrapPrevProps.max !== max &&
            typeof nextValue === 'number' &&
            nextValue > max
        ) {
          emit('change', max);
        }
        if (
            'min' in props &&
            unwrapPrevProps.min !== min &&
            typeof nextValue === 'number' &&
            nextValue < min
        ) {
          emit('change', min);
        }
      }
      prevProps.value = {...props};
      nextTick(() => {
        updatedFunc();
      });
    });
    onBeforeUnmount(() => {
      stop();
    });
    return {
      inputValue,
      sValue,
      blur,
      focus,
      handleInputClick,
      focused,
      onKeyUp,
      onChange,
      onKeyDown,
      onUp,
      onDown,
      onFocus,
      onBlur,
      stop,
      getInputDisplayValue,
      setInputRef: (el) => {
        inputRef.value = el;
      }
    };
  },
  render(ctx) {
    const instance = getCurrentInstance();
    const {
      prefixCls,
      onUp,
      onDown,
      disabled,
      readOnly,
      useTouch,
      autoComplete,
      upHandler,
      downHandler,
      sValue,
      focused
    } = ctx;
    const classes = classNames({
      [prefixCls]: true,
      [`${prefixCls}-disabled`]: disabled,
      [`${prefixCls}-focused`]: focused
    });
    let upDisabledClass = '';
    let downDisabledClass = '';
    if (sValue || sValue === 0) {
      if (!isNaN(sValue)) {
        const val = Number(sValue);
        if (val >= ctx.max) {
          upDisabledClass = `${prefixCls}-handler-up-disabled`;
        }
        if (val <= ctx.min) {
          downDisabledClass = `${prefixCls}-handler-down-disabled`;
        }
      } else {
        upDisabledClass = `${prefixCls}-handler-up-disabled`;
        downDisabledClass = `${prefixCls}-handler-down-disabled`;
      }
    }

    const editable = !ctx.readOnly && !ctx.disabled;

    // focus state, show input value
    // unfocus state, show valid value
    const inputDisplayValue = ctx.getInputDisplayValue();

    let upEvents;
    let downEvents;
    if (useTouch) {
      upEvents = {
        onTouchstart: (editable && !upDisabledClass) ? onUp : noop,
        onTouchend: ctx.stop
      };
      downEvents = {
        onTouchstart: (editable && !downDisabledClass) ? onDown : noop,
        onTouchend: ctx.stop
      };
    } else {
      upEvents = {
        onMousedown: (editable && !upDisabledClass) ? onUp : noop,
        onMouseup: ctx.stop,
        onMouseleave: ctx.stop
      };
      downEvents = {
        onMousedown: (editable && !downDisabledClass) ? onDown : noop,
        onMouseup: ctx.stop,
        onMouseleave: ctx.stop
      };
    }
    const isUpDisabled = !!upDisabledClass || disabled || readOnly;
    const isDownDisabled = !!downDisabledClass || disabled || readOnly;
    const {
      onMouseenter = noop,
      onMouseleave = noop,
      onMouseover = noop,
      onMouseout = noop
    } = getListenersFromInstance(instance);
    const contentProps = {
      onMouseenter, onMouseleave, onMouseover, onMouseout,
      class: classes,
      title: ctx.title
    };
    const upHandlerProps = {
      disabled: isUpDisabled,
      prefixCls,
      unselectable: 'unselectable',
      role: 'button',
      'aria-label': 'Increase Value',
      'aria-disabled': !!isUpDisabled,
      class: `${prefixCls}-handler ${prefixCls}-handler-up ${upDisabledClass}`,
      ...upEvents,
      ref: 'up'
    };
    const downHandlerProps = {
      disabled: isDownDisabled,
      prefixCls,
      unselectable: 'unselectable',
      role: 'button',
      'aria-label': 'Decrease Value',
      'aria-disabled': !!isDownDisabled,
      class: `${prefixCls}-handler ${prefixCls}-handler-down ${downDisabledClass}`,
      ...downEvents,
      ref: 'down'
    };
    // ref for test
    return (
        <div {...contentProps}>
          <div class={`${prefixCls}-handler-wrap`}>
            <InputHandler {...upHandlerProps}>
              {upHandler || (
                  <span
                      unselectable="on"
                      class={`${prefixCls}-handler-up-inner`}
                      onClick={preventDefault}
                  />
              )}
            </InputHandler>
            <InputHandler {...downHandlerProps}>
              {downHandler || (
                  <span
                      unselectable="on"
                      class={`${prefixCls}-handler-down-inner`}
                      onClick={preventDefault}
                  />
              )}
            </InputHandler>
          </div>
          <div class={`${prefixCls}-input-wrap`}>
            <input
                role="spinbutton"
                aria-valuemin={ctx.min}
                aria-valuemax={ctx.max}
                aria-valuenow={sValue}
                required={ctx.required}
                type={ctx.type}
                placeholder={ctx.placeholder}
                onClick={ctx.handleInputClick}
                class={`${prefixCls}-input`}
                tabindex={ctx.tabIndex}
                autocomplete={autoComplete}
                onFocus={ctx.onFocus}
                onBlur={ctx.onBlur}
                onKeydown={editable ? ctx.onKeyDown : noop}
                onKeyup={editable ? ctx.onKeyUp : noop}
                maxlength={ctx.maxLength}
                readonly={ctx.readOnly}
                disabled={ctx.disabled}
                max={ctx.max}
                min={ctx.min}
                step={ctx.step}
                name={ctx.name}
                title={ctx.title}
                id={ctx.id}
                onInput={ctx.onChange}
                ref={ctx.setInputRef}
                value={inputDisplayValue}
                pattern={ctx.pattern}
            />
          </div>
        </div>
    );
  }
});
