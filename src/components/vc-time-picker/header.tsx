import moment from 'moment';
import {defineComponent, onMounted, ref, watch, nextTick} from 'vue';
import PropTypes from '../_util/vue-types';

const Header = defineComponent({
  props: {
    format: PropTypes.string,
    prefixCls: PropTypes.string,
    disabledDate: PropTypes.func,
    placeholder: PropTypes.string,
    clearText: PropTypes.string,
    value: PropTypes.object,
    inputReadOnly: PropTypes.bool.def(false),
    hourOptions: PropTypes.array,
    minuteOptions: PropTypes.array,
    secondOptions: PropTypes.array,
    disabledHours: PropTypes.func,
    disabledMinutes: PropTypes.func,
    disabledSeconds: PropTypes.func,
    // onChange: PropTypes.func,
    // onClear: PropTypes.func,
    // onEsc: PropTypes.func,
    allowEmpty: PropTypes.bool,
    defaultOpenValue: PropTypes.object,
    currentSelectPanel: PropTypes.string,
    focusOnOpen: PropTypes.bool,
    // onKeyDown: PropTypes.func,
    clearIcon: PropTypes.any
  },
  setup(props, {emit}) {
    const str = ref((props.value && props.value.format(props.format)) || '');
    const invalid = ref(false);
    const inputRef = ref(undefined);
    const setInput = (el) => {
      inputRef.value = el;
    };
    const onInputChange = (e) => {
      const {value, composing} = e.target;
      const oldStr = str.value;
      if (e.isComposing || composing || oldStr === value) {
        return;
      }
      str.value = value;
      const {
        format,
        hourOptions,
        minuteOptions,
        secondOptions,
        disabledHours,
        disabledMinutes,
        disabledSeconds,
        value: originalValue
      } = props;

      if (str) {
        const value = getProtoValue().clone();
        const parsed = moment(str, format, true);
        if (!parsed.isValid()) {
          invalid.value = true;
          return;
        }
        value
            .hour(parsed.hour())
            .minute(parsed.minute())
            .second(parsed.second());

        // if time value not allowed, response warning.
        if (
            hourOptions.indexOf(value.hour()) < 0 ||
            minuteOptions.indexOf(value.minute()) < 0 ||
            secondOptions.indexOf(value.second()) < 0
        ) {
          invalid.value = true;
          return;
        }

        // if time value is disabled, response warning.
        const disabledHourOptions = disabledHours();
        const disabledMinuteOptions = disabledMinutes(value.hour());
        const disabledSecondOptions = disabledSeconds(value.hour(), value.minute());
        if (
            (disabledHourOptions && disabledHourOptions.indexOf(value.hour()) >= 0) ||
            (disabledMinuteOptions && disabledMinuteOptions.indexOf(value.minute()) >= 0) ||
            (disabledSecondOptions && disabledSecondOptions.indexOf(value.second()) >= 0)
        ) {
          invalid.value = true;
          return;
        }

        if (originalValue) {
          if (
              originalValue.hour() !== value.hour() ||
              originalValue.minute() !== value.minute() ||
              originalValue.second() !== value.second()
          ) {
            // keep other fields for rc-calendar
            const changedValue = originalValue.clone();
            changedValue.hour(value.hour());
            changedValue.minute(value.minute());
            changedValue.second(value.second());
            emit('change', changedValue);
          }
        } else if (originalValue !== value) {
          emit('change', value);
        }
      } else {
        emit('change', null);
      }
      invalid.value = false;
    };
    const getProtoValue = () => {
      return props.value || props.defaultOpenValue;
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        emit('esc');
      }
      emit('keydown', e);
    };
    const getInput = () => {
      const {prefixCls, placeholder, inputReadOnly} = props;
      const invalidClass = invalid.value ? `${prefixCls}-input-invalid` : '';
      return (
          <input
              class={`${prefixCls}-input ${invalidClass}`}
              ref={setInput}
              onKeydown={onKeyDown}
              value={str.value}
              placeholder={placeholder}
              onInput={onInputChange}
              readonly={!!inputReadOnly}
              {...{
                directives: [
                  {
                    name: 'ant-input'
                  }
                ]
              }}
          />
      );
    };
    onMounted(() => {
      if (props.focusOnOpen) {
        // Wait one frame for the panel to be positioned before focusing
        const requestAnimationFrame = window.requestAnimationFrame || window.setTimeout;
        requestAnimationFrame(() => {
          inputRef.value.focus();
          inputRef.value.select();
        });
      }
    });
    watch(()=>props.value,(val)=>{
      nextTick(() => {
        str.value = (val && val.format(props.format)) || ''
        invalid.value = false;
      });
    });
    return {
      str, invalid, onInputChange, onKeyDown, getInput
    };
  },
  render(ctx) {
    const {prefixCls} = ctx;
    return <div class={`${prefixCls}-input-wrap`}>{this.getInput()}</div>;
  }
}) as any;

export default Header;
