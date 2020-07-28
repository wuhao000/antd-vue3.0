import {useLocalValue} from '@/tools/value';
import moment from 'moment';
import {getCurrentInstance, ref} from 'vue';
import {getComponentFromProp, getListenersFromInstance} from '../_util/props-util';
import PropTypes from '../_util/vue-types';
import Combobox from './combobox';
import Header from './header';

function noop() {
}

function generateOptions(length, disabledOptions, hideDisabledOptions, step = 1) {
  const arr = [];
  for (let value = 0; value < length; value += step) {
    if (!disabledOptions || disabledOptions.indexOf(value) < 0 || !hideDisabledOptions) {
      arr.push(value);
    }
  }
  return arr;
}

function toNearestValidTime(time, hourOptions, minuteOptions, secondOptions) {
  const hour = hourOptions
      .slice()
      .sort((a, b) => Math.abs(time.hour() - a) - Math.abs(time.hour() - b))[0];
  const minute = minuteOptions
      .slice()
      .sort((a, b) => Math.abs(time.minute() - a) - Math.abs(time.minute() - b))[0];
  const second = secondOptions
      .slice()
      .sort((a, b) => Math.abs(time.second() - a) - Math.abs(time.second() - b))[0];
  return moment(`${hour}:${minute}:${second}`, 'HH:mm:ss');
}

const Panel = {
  props: {
    clearText: PropTypes.string,
    prefixCls: PropTypes.string.def('rc-time-picker-panel'),
    defaultOpenValue: {
      type: Object,
      default: () => {
        return moment();
      }
    },
    value: PropTypes.any,
    defaultValue: PropTypes.any,
    placeholder: PropTypes.string,
    format: PropTypes.string,
    inputReadOnly: PropTypes.bool.def(false),
    disabledHours: PropTypes.func.def(noop),
    disabledMinutes: PropTypes.func.def(noop),
    disabledSeconds: PropTypes.func.def(noop),
    hideDisabledOptions: PropTypes.bool,
    // onChange: PropTypes.func,
    // onEsc: PropTypes.func,
    allowEmpty: PropTypes.bool,
    showHour: PropTypes.bool,
    showMinute: PropTypes.bool,
    showSecond: PropTypes.bool,
    // onClear: PropTypes.func,
    use12Hours: PropTypes.bool.def(false),
    hourStep: PropTypes.number,
    minuteStep: PropTypes.number,
    secondStep: PropTypes.number,
    addon: PropTypes.func.def(noop),
    focusOnOpen: PropTypes.bool,
    // onKeydown: PropTypes.func,
    clearIcon: PropTypes.any
  },
  setup(props, {emit}) {
    const {value: sValue} = useLocalValue();
    const selectionRange = ref([]);
    const currentSelectPanel = ref(undefined);
    const isAM = () => {
      const value = sValue.value || props.defaultOpenValue;
      return value.hour() >= 0 && value.hour() < 12;
    };
    return {
      isAM,
      selectionRange,
      sValue,
      onChange(newValue) {
        sValue.value = newValue;
        emit('change', newValue);
      },

      onAmPmChange(ampm) {
        emit('amPmChange', ampm);
      },

      onCurrentSelectPanelChange(panel) {
        currentSelectPanel.value = panel;
      },
      close() {
        emit('esc');
      },
      onEsc(e) {
        emit('esc', e);
      },
      disabledHours2() {
        const {use12Hours, disabledHours} = props;
        let disabledOptions = disabledHours();
        if (use12Hours && Array.isArray(disabledOptions)) {
          if (isAM()) {
            disabledOptions = disabledOptions.filter(h => h < 12).map(h => (h === 0 ? 12 : h));
          } else {
            disabledOptions = disabledOptions.map(h => (h === 12 ? 12 : h - 12));
          }
        }
        return disabledOptions;
      }
    };
  },

  render(ctx) {
    const instance = getCurrentInstance();
    const {
      prefixCls,
      placeholder,
      disabledMinutes,
      addon,
      disabledSeconds,
      hideDisabledOptions,
      showHour,
      showMinute,
      showSecond,
      format,
      defaultOpenValue,
      clearText,
      use12Hours,
      focusOnOpen,
      hourStep,
      minuteStep,
      secondStep,
      inputReadOnly,
      sValue,
      currentSelectPanel
    } = ctx;
    const clearIcon = getComponentFromProp(currentSelectPanel, 'clearIcon');
    const {esc = noop, keydown = noop} = getListenersFromInstance(instance);

    const disabledHourOptions = ctx.disabledHours2();
    const disabledMinuteOptions = disabledMinutes(sValue ? sValue.hour() : null);
    const disabledSecondOptions = disabledSeconds(
        sValue ? sValue.hour() : null,
        sValue ? sValue.minute() : null
    );
    const hourOptions = generateOptions(24, disabledHourOptions, hideDisabledOptions, hourStep);
    const minuteOptions = generateOptions(
        60,
        disabledMinuteOptions,
        hideDisabledOptions,
        minuteStep
    );
    const secondOptions = generateOptions(
        60,
        disabledSecondOptions,
        hideDisabledOptions,
        secondStep
    );
    const validDefaultOpenValue = toNearestValidTime(
        defaultOpenValue,
        hourOptions,
        minuteOptions,
        secondOptions
    );
    return (
        <div class={`${prefixCls}-inner`}>
          <Header
              clearText={clearText}
              prefixCls={prefixCls}
              defaultOpenValue={validDefaultOpenValue}
              value={sValue}
              currentSelectPanel={currentSelectPanel}
              onEsc={esc}
              format={format}
              placeholder={placeholder}
              hourOptions={hourOptions}
              minuteOptions={minuteOptions}
              secondOptions={secondOptions}
              disabledHours={ctx.disabledHours2}
              disabledMinutes={disabledMinutes}
              disabledSeconds={disabledSeconds}
              onChange={ctx.onChange}
              focusOnOpen={focusOnOpen}
              onKeydown={keydown}
              inputReadOnly={inputReadOnly}
              clearIcon={clearIcon}
          />
          <Combobox
              prefixCls={prefixCls}
              value={sValue}
              defaultOpenValue={validDefaultOpenValue}
              format={format}
              onChange={ctx.onChange}
              onAmPmChange={ctx.onAmPmChange}
              showHour={showHour}
              showMinute={showMinute}
              showSecond={showSecond}
              hourOptions={hourOptions}
              minuteOptions={minuteOptions}
              secondOptions={secondOptions}
              disabledHours={ctx.disabledHours2}
              disabledMinutes={disabledMinutes}
              disabledSeconds={disabledSeconds}
              onCurrentSelectPanelChange={ctx.onCurrentSelectPanelChange}
              use12Hours={use12Hours}
              onEsc={ctx.onEsc}
              isAM={ctx.isAM()}
          />
          {addon(this)}
        </div>
    );
  }
} as any;

export default Panel;
