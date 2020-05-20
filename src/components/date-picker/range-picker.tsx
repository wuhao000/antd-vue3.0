import classNames from 'classnames';
import * as moment from 'moment';
import shallowequal from 'shallowequal';
import {getCurrentInstance} from 'vue';
import BaseMixin from '../_util/base-mixin';
import interopDefault from '../_util/interopDefault';
import {
  getComponentFromProp,
  getListeners,
  getOptionProps,
  hasProp,
  initDefaultProps,
  mergeProps
} from '../_util/props-util';
import {ConfigConsumerProps, useConfigProvider} from '../config-provider';
import Icon from '../icon';
import Tag from '../tag';
import VcDatePicker from '../vc-calendar/src/picker';
import RangeCalendar from '../vc-calendar/src/range-calendar';
import InputIcon from './input-icon';
import {RangePickerProps} from './interface';
import {formatDate} from './utils';

function noop() {
}

function getShowDateFromValue(value, mode) {
  const [start, end] = value;
  // value could be an empty array, then we should not reset showDate
  if (!start && !end) {
    return;
  }
  if (mode && mode[0] === 'month') {
    return [start, end];
  }
  const newEnd = end && end.isSame(start, 'month') ? end.clone().add(1, 'month') : end;
  return [start, newEnd];
}

function pickerValueAdapter(value) {
  if (!value) {
    return;
  }
  if (Array.isArray(value)) {
    return value;
  }
  return [value, value.clone().add(1, 'month')];
}

function isEmptyArray(arr) {
  if (Array.isArray(arr)) {
    return arr.length === 0 || arr.every(i => !i);
  }
  return false;
}

function fixLocale(value, localeCode) {
  if (!localeCode) {
    return;
  }
  if (!value || value.length === 0) {
    return;
  }
  const [start, end] = value;
  if (start) {
    start.locale(localeCode);
  }
  if (end) {
    end.locale(localeCode);
  }
}

export default {
  name: 'ARangePicker',
  mixins: [BaseMixin],
  model: {
    prop: 'value',
    event: 'change'
  },
  props: initDefaultProps(RangePickerProps(), {
    allowClear: true,
    showToday: false,
    separator: '~'
  }),
  inject: {
    configProvider: {default: () => ConfigConsumerProps}
  },
  data() {
    const value = this.value || this.defaultValue || [];
    const [start, end] = value;
    if (
      (start && !interopDefault(moment).isMoment(start)) ||
      (end && !interopDefault(moment).isMoment(end))
    ) {
      throw new Error(
        'The value/defaultValue of RangePicker must be a moment object array after `antd@2.0`, ' +
        'see: https://u.ant.design/date-picker-value'
      );
    }
    const pickerValue = !value || isEmptyArray(value) ? this.defaultPickerValue : value;
    return {
      sValue: value,
      sShowDate: pickerValueAdapter(pickerValue || interopDefault(moment)()),
      sOpen: this.open,
      sHoverValue: []
    };
  },
  watch: {
    value(val) {
      const value = val || [];
      let state = {sValue: value};
      if (!shallowequal(val, this.sValue)) {
        state = {
          ...state,
          sShowDate: getShowDateFromValue(value, this.mode) || this.sShowDate
        };
      }
      this.setState(state);
    },
    open(val) {
      const state = {sOpen: val};
      this.setState(state);
    },
    sOpen(val, oldVal) {
      this.$nextTick(() => {
        if (!hasProp(this, 'open') && oldVal && !val) {
          this.focus();
        }
      });
    }
  },
  methods: {
    setValue(value, hidePanel) {
      this.handleChange(value);
      if ((hidePanel || !this.showTime) && !hasProp(this, 'open')) {
        this.setState({sOpen: false});
      }
    },
    clearSelection(e) {
      e.preventDefault();
      e.stopPropagation();
      this.setState({sValue: []});
      this.handleChange([]);
    },

    clearHoverValue() {
      this.setState({sHoverValue: []});
    },

    handleChange(value) {
      if (!hasProp(this, 'value')) {
        this.setState(({sShowDate}) => ({
          sValue: value,
          sShowDate: getShowDateFromValue(value) || sShowDate
        }));
      }
      if (value[0] && value[1] && value[0].diff(value[1]) > 0) {
        value[1] = undefined;
      }
      const [start, end] = value;
      this.$emit('change', value, [formatDate(start, this.format), formatDate(end, this.format)]);
    },

    handleOpenChange(open) {
      if (!hasProp(this, 'open')) {
        this.setState({sOpen: open});
      }

      if (open === false) {
        this.clearHoverValue();
      }
      this.$emit('openChange', open);
    },

    handleShowDateChange(showDate) {
      this.setState({sShowDate: showDate});
    },

    handleHoverChange(hoverValue) {
      this.setState({sHoverValue: hoverValue});
    },

    handleRangeMouseLeave() {
      if (this.sOpen) {
        this.clearHoverValue();
      }
    },

    handleCalendarInputSelect(value) {
      const [start] = value;
      if (!start) {
        return;
      }
      this.setState(({sShowDate}) => ({
        sValue: value,
        sShowDate: getShowDateFromValue(value) || sShowDate
      }));
    },

    handleRangeClick(value) {
      if (typeof value === 'function') {
        value = value();
      }

      this.setValue(value, true);
      this.$emit('ok', value);
      this.$emit('openChange', false);
    },

    onMouseEnter(e) {
      this.$emit('mouseenter', e);
    },
    onMouseLeave(e) {
      this.$emit('mouseleave', e);
    },

    focus() {
      this.$refs.picker.focus();
    },

    blur() {
      this.$refs.picker.blur();
    },

    renderFooter() {
      const instance  =  getCurrentInstance();
      const {ranges, $scopedSlots, $slots} = this;
      const {_prefixCls: prefixCls, _tagPrefixCls: tagPrefixCls} = this;
      const renderExtraFooter = getComponentFromProp(instance, 'renderExtraFooter');
      if (!ranges && !renderExtraFooter) {
        return null;
      }
      const customFooter = renderExtraFooter ? (
        <div class={`${prefixCls}-footer-extra`} key="extra">
          {typeof renderExtraFooter === 'function' ? renderExtraFooter() : renderExtraFooter}
        </div>
      ) : null;
      const operations =
        ranges &&
        Object.keys(ranges).map(range => {
          const value = ranges[range];
          const hoverValue = typeof value === 'function' ? value.call(this) : value;
          return (
            <Tag
              key={range}
              prefixCls={tagPrefixCls}
              color="blue"
              onClick={() => this.handleRangeClick(value)}
              onMouseenter={() => this.setState({sHoverValue: hoverValue})}
              onMouseleave={this.handleRangeMouseLeave}
            >
              {range}
            </Tag>
          );
        });
      const rangeNode =
        operations && operations.length > 0 ? (
          <div class={`${prefixCls}-footer-extra ${prefixCls}-range-quick-selector`} key="range">
            {operations}
          </div>
        ) : null;
      return [rangeNode, customFooter];
    }
  },

  render() {
    const instance = getCurrentInstance();
    const props = getOptionProps(instance);
    let suffixIcon = getComponentFromProp(instance, 'suffixIcon');
    suffixIcon = Array.isArray(suffixIcon) ? suffixIcon[0] : suffixIcon;
    const {
      sValue: value,
      sShowDate: showDate,
      sHoverValue: hoverValue,
      sOpen: open
    } = this;
    const listeners = getListeners(this);
    const {
      calendarChange = noop,
      ok = noop,
      focus = noop,
      blur = noop,
      panelChange = noop
    } = listeners;
    const {
      prefixCls: customizePrefixCls,
      tagPrefixCls: customizeTagPrefixCls,
      popupStyle,
      disabledDate,
      disabledTime,
      showTime,
      showToday,
      ranges,
      locale,
      localeCode,
      format,
      separator
    } = props;
    const configProvider = useConfigProvider();
    const getPrefixCls = configProvider.getPrefixCls;
    const prefixCls = getPrefixCls('calendar', customizePrefixCls);
    const tagPrefixCls = getPrefixCls('tag', customizeTagPrefixCls);
    this._prefixCls = prefixCls;
    this._tagPrefixCls = tagPrefixCls;

    const dateRender = getComponentFromProp(instance, 'dateRender');
    fixLocale(value, localeCode);
    fixLocale(showDate, localeCode);

    const calendarClassName = classNames({
      [`${prefixCls}-time`]: showTime,
      [`${prefixCls}-range-with-ranges`]: ranges
    });

    // 需要选择时间时，点击 ok 时才触发 onChange
    const pickerChangeHandler = {
      on: {
        change: this.handleChange
      }
    };
    let calendarProps = {
      onOk: this.handleChange
    };
    if (props.timePicker) {
      pickerChangeHandler.onChange = changedValue => this.handleChange(changedValue);
    } else {
      calendarProps = {};
    }
    if ('mode' in props) {
      calendarProps.mode = props.mode;
    }

    const startPlaceholder = Array.isArray(props.placeholder)
      ? props.placeholder[0]
      : locale.lang.rangePlaceholder[0];
    const endPlaceholder = Array.isArray(props.placeholder)
      ? props.placeholder[1]
      : locale.lang.rangePlaceholder[1];

    const rangeCalendarProps = mergeProps(calendarProps, {
      separator,
      format,
      prefixCls,
      renderFooter: this.renderFooter,
      timePicker: props.timePicker,
      disabledDate,
      disabledTime,
      dateInputPlaceholder: [startPlaceholder, endPlaceholder],
      locale: locale.lang,
      dateRender,
      value: showDate,
      hoverValue,
      showToday,
      onChange: calendarChange,
      onOK: ok,
      onValueChange: this.handleShowDateChange,
      onHoverChange: this.handleHoverChange,
      onPanelChange: panelChange,
      onInputSelect: this.handleCalendarInputSelect,
      class: calendarClassName
    });
    const calendar = <RangeCalendar {...rangeCalendarProps} />;

    // default width for showTime
    const pickerStyle = {};
    if (props.showTime) {
      pickerStyle.width = '350px';
    }
    const [startValue, endValue] = value;
    const clearIcon =
      !props.disabled && props.allowClear && value && (startValue || endValue) ? (
        <Icon
          type="close-circle"
          class={`${prefixCls}-picker-clear`}
          onClick={this.clearSelection}
          theme="filled"
        />
      ) : null;

    const inputIcon = <InputIcon suffixIcon={suffixIcon} prefixCls={prefixCls}/>;

    const input = ({value: inputValue}) => {
      const [start, end] = inputValue;
      return (
        <span class={props.pickerInputClass}>
          <input
            disabled={props.disabled}
            readonly={true}
            value={formatDate(start, props.format)}
            placeholder={startPlaceholder}
            class={`${prefixCls}-range-picker-input`}
            tabindex={-1}
          />
          <span class={`${prefixCls}-range-picker-separator`}> {separator} </span>
          <input
            disabled={props.disabled}
            readonly={true}
            value={formatDate(end, props.format)}
            placeholder={endPlaceholder}
            class={`${prefixCls}-range-picker-input`}
            tabindex={-1}
          />
          {clearIcon}
          {inputIcon}
        </span>
      );
    };
    const vcDatePickerProps = mergeProps(
      {
        ...props,
        ...listeners
      },
      pickerChangeHandler,
      {
        calendar,
        value,
        open,
        prefixCls: `${prefixCls}-picker-container`,
        onOpenChange: this.handleOpenChange,
        style: popupStyle
      }
    );
    return (
      <span
        ref="picker"
        class={props.pickerClass}
        style={pickerStyle}
        tabindex={props.disabled ? -1 : 0}
        onFocus={focus}
        onBlur={blur}
        onMouseenter={this.onMouseEnter}
        onMouseleave={this.onMouseLeave}
      >
        <VcDatePicker {...vcDatePickerProps}>
          {input}
        </VcDatePicker>
      </span>
    );
  }
};
