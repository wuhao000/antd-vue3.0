import moment from 'moment';
import {defineComponent, getCurrentInstance, nextTick, onUpdated, ref, watch} from 'vue';
import KeyCode from '../../../_util/keycode';
import {getComponentFromProp} from '../../../_util/props-util';
import PropTypes from '../../../_util/vue-types';
import {formatDate} from '../util';

let cachedSelectionStart;
let cachedSelectionEnd;
let dateInputInstance;

const DateInput = defineComponent({
  name: 'DateInput',
  props: {
    prefixCls: PropTypes.string,
    timePicker: PropTypes.object,
    value: PropTypes.object,
    disabledTime: PropTypes.any,
    format: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
    locale: PropTypes.object,
    disabledDate: PropTypes.func,
    // onChange: PropTypes.func,
    // onClear: PropTypes.func,
    placeholder: PropTypes.string,
    // onSelect: PropTypes.func,
    selectedValue: PropTypes.object,
    clearIcon: PropTypes.any,
    inputMode: PropTypes.string
  },

  setup(props, {emit}) {
    const selectedValue = ref(props.selectedValue);
    const hasFocus = ref(false);
    const str = ref(formatDate(selectedValue.value, props.format));
    const invalid = ref(false);
    const updateState = () => {
      if (dateInputInstance) {
        cachedSelectionStart = dateInputInstance.selectionStart;
        cachedSelectionEnd = dateInputInstance.selectionEnd;
      }
      // when popup show, click body will call this, bug!
      if (!hasFocus.value) {
        str.value = formatDate(selectedValue.value, props.format);
        invalid.value = false;
      }
    };
    watch(() => selectedValue.value, (val) => {
      updateState();
    });
    const onInputChange = (e) => {
      const {value: tmpStr, composing} = e.target;
      const oldStr = tmpStr.value;
      if (composing || oldStr === tmpStr) {
        return;
      }
      const {disabledDate, format} = props;
      // 没有内容，合法并直接退出
      if (!tmpStr) {
        emit('change', null);
        invalid.value = false;
        str.value = tmpStr;
        return;
      }

      // 不合法直接退出
      const parsed = moment(tmpStr, format, true);
      if (!parsed.isValid()) {
        invalid.value = true;
        str.value = tmpStr;
        return;
      }
      const value = props.value.clone();
      value
          .year(parsed.year())
          .month(parsed.month())
          .date(parsed.date())
          .hour(parsed.hour())
          .minute(parsed.minute())
          .second(parsed.second());

      if (!value || (disabledDate && disabledDate(value))) {
        invalid.value = true;
        str.value = tmpStr;
        return;
      }

      if (selectedValue.value !== value || (selectedValue.value && value && !selectedValue.value.isSame(value))) {
        invalid.value = false;
        str.value = tmpStr;
        emit('change', value);
      }
    };
    const onFocus = () => {
      hasFocus.value = true;
    };
    const onClear = () => {
      str.value = '';
      emit('clear', null);
    };
    watch(() => props.format, () => {
      updateState();
    });
    onUpdated(() => {
      nextTick(() => {
        if (
            dateInputInstance &&
            hasFocus.value &&
            !invalid.value &&
            !(cachedSelectionStart === 0 && cachedSelectionEnd === 0)
        ) {
          dateInputInstance.setSelectionRange(cachedSelectionStart, cachedSelectionEnd);
        }
      });
    });
    return {
      str,
      invalid,
      hasFocus,
      onClear,
      onFocus,
      onInputChange,
      onBlur() {
        hasFocus.value = false;
        str.value = formatDate(props.value, props.format);
      },
      onKeyDown(event) {
        const {keyCode} = event;
        const {value, disabledDate} = props;
        if (keyCode === KeyCode.ENTER) {
          const validateDate = !disabledDate || !disabledDate(value);
          if (validateDate) {
            emit('select', value.clone());
          }
          event.preventDefault();
        }
      },
      focus() {
        if (dateInputInstance) {
          dateInputInstance.focus();
        }
      },
      saveDateInput(dateInput) {
        dateInputInstance = dateInput;
      }
    };
  },
  getInstance() {
    return dateInputInstance;
  },
  render(ctx) {
    const instance = getCurrentInstance();
    const {invalid, str, locale, prefixCls, placeholder, disabled, showClear, inputMode} = ctx;
    const clearIcon = getComponentFromProp(instance, 'clearIcon');
    const invalidClass = invalid ? `${prefixCls}-input-invalid` : '';
    return (
        <div class={`${prefixCls}-input-wrap`}>
          <div class={`${prefixCls}-date-input-wrap`}>
            <input
                ref={this.saveDateInput}
                class={`${prefixCls}-input ${invalidClass}`}
                value={str}
                disabled={disabled}
                placeholder={placeholder}
                onInput={ctx.onInputChange}
                onKeydown={ctx.onKeyDown}
                onFocus={ctx.onFocus}
                onBlur={ctx.onBlur}
                inputmode={inputMode}
            />
          </div>
          {showClear ? (
              <a role="button" title={locale.clear} onClick={this.onClear}>
                {clearIcon || <span class={`${prefixCls}-clear-btn`}/>}
              </a>
          ) : null}
        </div>
    );
  }
}) as any;

export default DateInput;
