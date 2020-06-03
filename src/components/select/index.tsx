import Menu from '@/components/menu';
import MenuItem from '@/components/menu/menu-item';
import MenuItemGroup from '@/components/menu/menu-item-group';
import {getAlignFromPlacement, isHidden} from '@/components/select/utils';
import {useBaseInput} from '@/tools/base-input';
import {chaining} from '@/utils/chain';
import classnames from 'classnames';
import classes from 'component-classes';
import raf from 'raf';
import {
  App,
  cloneVNode,
  computed,
  defineComponent,
  getCurrentInstance,
  nextTick,
  onMounted,
  onUpdated,
  ref,
  Transition,
  TransitionGroup,
  watch
} from 'vue';
import animate from '../_util/css-animation';
import {isEdge, isIE} from '../_util/env';
import getTransitionProps from '../_util/get-transition-props';
import KeyCode from '../_util/keycode';
import {
  filterEmpty,
  getAttrs,
  getClassFromVNode,
  getComponentFromProp,
  getListenersFromInstance,
  getListenersFromVNode,
  getPropsData,
  getSlotOptions,
  getSlots,
  getStyleFromInstance,
  getValueByProp as getValue,
  isValidElement
} from '../_util/props-util';
import PropTypes from '../_util/vue-types';
import Base from '../base';
import Icon from '../icon';
import Trigger from '../vc-trigger';
import contains from '../vc-util/Dom/contains';
import OptGroup from './opt-group';
import Option from './option';
import {
  findFirstMenuItem,
  findIndexInValueBySingleValue,
  getLabelFromPropsValue,
  getMapKey,
  getPropValue,
  getSelectKeys,
  getValuePropValue,
  includesSeparators,
  isCombobox,
  isMultipleOrTags,
  isMultipleOrTagsOrCombobox,
  isSingleMode,
  preventDefaultEvent,
  splitBySeparators,
  toArray,
  toTitle,
  UNSELECTABLE_ATTRIBUTE,
  UNSELECTABLE_STYLE,
  validateOptionValue
} from './utils';

const BUILT_IN_PLACEMENTS = {
  bottomLeft: {
    points: ['tl', 'bl'],
    offset: [0, 4],
    overflow: {
      adjustX: 0,
      adjustY: 1
    }
  },
  topLeft: {
    points: ['bl', 'tl'],
    offset: [0, -4],
    overflow: {
      adjustX: 0,
      adjustY: 1
    }
  }
};

const SELECT_EMPTY_VALUE_KEY = 'RC_SELECT_EMPTY_VALUE_KEY';

const Value = PropTypes.shape({
  key: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
}).loose;

const SelectValue = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.number,
  PropTypes.arrayOf(PropTypes.oneOfType([Value, PropTypes.string, PropTypes.number])),
  Value
]);

const SelectProps = {
  allowClear: PropTypes.bool.def(false),
  autoFocus: PropTypes.bool,
  autoClearSearchValue: PropTypes.bool.def(true),
  backfill: PropTypes.bool.def(false),
  choiceTransitionName: PropTypes.string,
  disabled: PropTypes.bool,
  defaultActiveFirstOption: PropTypes.bool,
  dropdownClassName: PropTypes.string,
  dropdownStyle: PropTypes.any,
  dropdownMenuStyle: PropTypes.any,
  dropdownMatchSelectWidth: PropTypes.bool.def(true),
  defaultValue: SelectValue,
  defaultOpen: PropTypes.bool.def(false),
  dropdownRender: PropTypes.func.def(() => menu => menu),
  // onSearch: (value: string) => any,
  filterOption: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
  notFoundContent: PropTypes.any.def('暂无数据'),
  placeholder: PropTypes.any.def(''),
  prefixCls: PropTypes.string.def('ant-select'),
  size: PropTypes.oneOf(['small', 'large', 'default']),
  showAction: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(String)])
      .def(() => ['click']),
  showSearch: PropTypes.bool.def(true),
  transitionName: PropTypes.string,
  tabIndex: PropTypes.number,
  showArrow: PropTypes.bool,
  getPopupContainer: PropTypes.func,
  open: PropTypes.bool,
  loading: PropTypes.bool,
  value: SelectValue,
  // mode: PropTypes.oneOf(['default', 'multiple', 'tags', 'combobox']),
  mode: PropTypes.string,
  optionLabelProp: PropTypes.string,
  firstActiveValue: PropTypes.oneOfType([String, PropTypes.arrayOf(String)]),
  maxTagCount: PropTypes.number,
  maxTagPlaceholder: PropTypes.any,
  maxTagTextLength: PropTypes.number,
  optionFilterProp: PropTypes.string.def('value'),
  labelInValue: PropTypes.boolean,
  tokenSeparators: PropTypes.arrayOf(PropTypes.string).def(() => []),
  getInputElement: PropTypes.func,
  options: PropTypes.array,
  suffixIcon: PropTypes.any,
  removeIcon: PropTypes.any,
  clearIcon: PropTypes.any,
  menuItemSelectedIcon: PropTypes.any
};

const SelectPropTypes = {
  prefixCls: PropTypes.string,
  size: PropTypes.oneOf(['default', 'large', 'small']),
  // combobox: PropTypes.bool,
  notFoundContent: PropTypes.any,
  showSearch: PropTypes.bool,
  transitionName: PropTypes.string,
  choiceTransitionName: PropTypes.string
};

export {SelectValue, SelectProps};
const SECRET_COMBOBOX_MODE_DO_NOT_USE = 'SECRET_COMBOBOX_MODE_DO_NOT_USE';
const Select = defineComponent({
  SECRET_COMBOBOX_MODE_DO_NOT_USE,
  Option: {...Option, name: 'ASelectOption'},
  OptGroup: {...OptGroup, name: 'ASelectOptGroup'},
  name: 'ASelect',
  props: {
    ...SelectProps,
    showSearch: PropTypes.bool.def(false),
    transitionName: PropTypes.string.def('slide-up'),
    choiceTransitionName: PropTypes.string.def('zoom')
  },
  setup($props, {emit, slots, attrs}) {
    const {_emit} = useBaseInput();
    const currentInstance = getCurrentInstance();
    const firstActiveItem = ref(null);
    const _mouseDown = ref(false);
    /**
     * 获取选项值对应的选项信息
     * @param value
     * @param optionsInfo
     * @return {any}
     */
    const getOptionInfoBySingleValue = (value, optionsInfo?) => {
      const copyOptionsInfo = optionsInfo || _optionsInfo.value;
      if (copyOptionsInfo[getMapKey(value)]) {
        return copyOptionsInfo[getMapKey(value)];
      }
      let defaultLabel = value;
      if ($props.labelInValue) {
        const valueLabel = getLabelFromPropsValue($props.value, value);
        const defaultValueLabel = getLabelFromPropsValue($props.defaultValue, value);
        if (valueLabel !== undefined) {
          defaultLabel = valueLabel;
        } else if (defaultValueLabel !== undefined) {
          defaultLabel = defaultValueLabel;
        }
      }
      return {
        option: (
            <Option value={value} key={value}>
              {value}
            </Option>
        ),
        value,
        label: defaultLabel
      };
    };
    const getInputValueForCombobox = (props, optionsInfo, useDefaultValue?) => {
      let value = [];
      if ('value' in props && !useDefaultValue) {
        value = toArray(props.value);
      }
      if ('defaultValue' in props && useDefaultValue) {
        value = toArray(props.defaultValue);
      }
      let first = null;
      if (value.length) {
        first = value[0];
      } else {
        return '';
      }
      let label = first;
      if (props.labelInValue) {
        label = first.label;
      } else if (optionsInfo[getMapKey(first)]) {
        label = optionsInfo[getMapKey(first)].label;
      }
      if (label === undefined) {
        label = '';
      }
      return label;
    };
    const getOptionsFromChildren = (children = [], options = []) => {
      if (children.length === 1 && children[0].__v_skip) {
        const deepChildren = children[0].children;
        if (Array.isArray(deepChildren)) {
          return getOptionsFromChildren(deepChildren, options);
        } else {
          return getOptionsFromChildren(deepChildren.default && deepChildren.default(), options);
        }
      }
      children.forEach(child => {
        if (Array.isArray(child.children)) {
          options.push(child);
          return;
        }
        if (!child.children.default) {
          return;
        }
        if (getSlotOptions(child).isSelectOptGroup) {
          getOptionsFromChildren(child.componentOptions.children, options);
        } else {
          options.push(child);
        }
      });
      return options;
    };
    const getOptionLabelProp = () => {
      let {optionLabelProp} = $props;
      if (isCombobox($props)) {
        // children 带 dom 结构时，无法填入输入框
        optionLabelProp = optionLabelProp || 'value';
      }
      return optionLabelProp || 'children';
    };
    const getLabelFromOption = (props, option) => {
      return getPropValue(option, getOptionLabelProp());
    };
    const getOptionsInfoFromProps = (props, preState: boolean = false) => {
      const children = slots.default && slots.default() || [];
      const options = getOptionsFromChildren(children);
      const optionsInfo = {};
      options.forEach(option => {
        const singleValue = getValuePropValue(option);
        optionsInfo[getMapKey(singleValue)] = {
          option,
          value: singleValue,
          label: getLabelFromOption(props, option),
          title: getValue(option, 'title'),
          disabled: getValue(option, 'disabled')
        };
      });
      if (preState) {
        // keep option info in pre state value.
        const oldOptionsInfo = _optionsInfo.value;
        const value = _value.value;
        if (value) {
          value.forEach(v => {
            const key = getMapKey(v);
            if (!optionsInfo[key] && oldOptionsInfo[key] !== undefined) {
              optionsInfo[key] = oldOptionsInfo[key];
            }
          });
        }
      }
      return optionsInfo;
    };
    const optionsInfo = getOptionsInfoFromProps($props);
    const _inputValue = ref($props.mode === 'combobox'
        ? getInputValueForCombobox(
            $props,
            optionsInfo,
            true // use default value
        )
        : '');
    const _mirrorInputValue = ref(_inputValue.value);
    const _open = ref($props.defaultOpen);
    const _options = ref([]);
    const getValueFromProps = () => {
      let value = [];
      if ($props.defaultValue !== undefined) {
        value = toArray($props.defaultValue);
      }
      if ($props.value !== undefined) {
        value = toArray($props.value);
      }
      if ($props.labelInValue) {
        value = value.map(v => {
          return v.key;
        });
      }
      return value;
    };
    const _optionsInfo = ref(optionsInfo);
    const _focused = ref(false);
    const inputClick = (e) => {
      if (_open.value) {
        clearBlurTime();
        e.stopPropagation();
      } else {
        _focused.value = false;
      }
    };
    const _value = ref(getValueFromProps());
    watch(() => $props.value, () => {
      _value.value = getValueFromProps();
    });
    const inputRef = ref(null);
    const getVLBySingleValue = (value) => {
      if ($props.labelInValue) {
        return {
          key: value,
          label: getLabelBySingleValue(value)
        };
      }
      return value;
    };
    const fireSelect = (value) => {
      emit('select', getVLBySingleValue(value), getOptionBySingleValue(value));
    };
    const getValueByLabel = (label) => {
      if (label === undefined) {
        return null;
      }
      let value = null;
      Object.keys(_optionsInfo.value).forEach(key => {
        const info = _optionsInfo.value[key];
        const {disabled} = info;
        if (disabled) {
          return;
        }
        const oldLable = toArray(info.label);
        if (oldLable && oldLable.join('') === label) {
          value = info.value;
        }
      });
      return value;
    };
    const getValueByInput = (str) => {
      const {tokenSeparators} = $props;
      const multiple = $props.mode === 'multiple';
      let nextValue = _value.value;
      let hasNewValue = false;
      splitBySeparators(str, tokenSeparators).forEach(label => {
        const selectedValue = [label];
        if (multiple) {
          const value = getValueByLabel(label);
          if (value && findIndexInValueBySingleValue(nextValue, value) === -1) {
            nextValue = nextValue.concat(value);
            hasNewValue = true;
            fireSelect(value);
          }
        } else if (findIndexInValueBySingleValue(nextValue, label) === -1) {
          nextValue = nextValue.concat(selectedValue);
          hasNewValue = true;
          fireSelect(label);
        }
      });
      return hasNewValue ? nextValue : undefined;
    };
    const inputBlur = (e) => {
      const target = e.relatedTarget || document.activeElement;

      // https://github.com/vueComponent/ant-design-vue/issues/999
      // https://github.com/vueComponent/ant-design-vue/issues/1223
      if (
          (isIE || isEdge) &&
          (e.relatedTarget === arrowRef.value ||
              (target && menuRef.value === target) ||
              contains(e.target, target))
      ) {
        e.target.focus();
        e.preventDefault();
        return;
      }
      clearBlurTime();
      if ($props.disabled) {
        e.preventDefault();
        return;
      }
      blurTimer.value = setTimeout(() => {
        _focused.value = false;
        updateFocusClassName();
        if (
            isSingleMode($props) &&
            $props.showSearch &&
            _inputValue.value &&
            $props.defaultActiveFirstOption
        ) {
          const options = _options.value || [];
          if (options.length) {
            const firstOption = findFirstMenuItem(options);
            if (firstOption) {
              _value.value = [getValuePropValue(firstOption)];
              fireChange(_value.value);
            }
          }
        } else if (isMultipleOrTags($props) && _inputValue.value) {
          if (_mouseDown.value) {
            // need update dropmenu when not blur
            setInputValue('');
          } else {
            // why not use setState?
            _inputValue.value = '';
            if (getInputDOMNode && getInputDOMNode()) {
              getInputDOMNode().value = '';
            }
          }
          const tmpValue = getValueByInput(_inputValue.value);
          if (tmpValue !== undefined) {
            _value.value = tmpValue;
            fireChange(_value.value);
          }
        }
        // if click the rest space of Select in multiple mode
        if (isMultipleOrTags($props) && _mouseDown.value) {
          maybeFocus(true, true);
          _mouseDown.value = false;
          return;
        }
        setOpenState(false);
        _emit('blur', getVLForOnChange(_value.value));
      }, 200);
    };
    const onInputChange = (e) => {
      const {value: val, composing} = e.target;

      if (e.isComposing || composing || _inputValue.value === val) {
        _mirrorInputValue.value = val;
        return;
      }
      const {tokenSeparators} = $props;
      if (
          isMultipleOrTags($props) &&
          tokenSeparators.length &&
          includesSeparators(val, tokenSeparators)
      ) {
        const nextValue = getValueByInput(val);
        if (nextValue !== undefined) {
          fireChange(nextValue);
        }
        setOpenState(false, {needFocus: true});
        setInputValue('', false);
        return;
      }
      setInputValue(val);
      _open.value = true;
      if (isCombobox($props)) {
        fireChange([val]);
      }
    };
    const topCtrlRef = ref(null);
    const rootRef = ref(null);
    const getInputDOMNode = () => {
      return topCtrlRef.value
          ? topCtrlRef.value.querySelector('input,textarea,div[contentEditable]')
          : inputRef.value;
    };
    const updateFocusClassName = () => {
      // avoid setState and its side effect
      if (_focused.value) {
        classes(rootRef.value).add(`${$props.prefixCls}-focused`);
      } else {
        classes(rootRef.value).remove(`${$props.prefixCls}-focused`);
      }
    };
    const inputMirrorRef = ref(null);
    const focusTimer = ref(null);
    const clearFocusTime = () => {
      if (focusTimer.value) {
        clearTimeout(focusTimer.value);
        focusTimer.value = null;
      }
    };
    const timeoutFocus = () => {
      if (focusTimer.value) {
        clearFocusTime();
      }
      focusTimer.value = window.setTimeout(() => {
        emit('focus');
        setOpenState(true);
      }, 10);
    };
    const inputFocus = (e) => {
      if ($props.disabled) {
        e.preventDefault();
        return;
      }
      clearBlurTime();

      // In IE11, onOuterFocus will be trigger twice when focus input
      // First one: e.target is div
      // Second one: e.target is input
      // other browser only trigger second one
      // https://github.com/ant-design/ant-design/issues/15942
      // Here we ignore the first one when e.target is div
      const inputNode = getInputDOMNode();
      if (inputNode && e.target === rootRef.value) {
        return;
      }
      if (!isMultipleOrTagsOrCombobox($props) && e.target === inputNode) {
        return;
      }
      if (_focused.value) {
        return;
      }
      _focused.value = true;
      updateFocusClassName();
      // only effect multiple or tag mode
      if (!isMultipleOrTags($props) || !_mouseDown.value) {
        timeoutFocus();
      }
    };
    const _getInputElement = () => {
      const defaultInput = <input id={attrs.id as string} autocomplete="off"/>;
      const inputElement = $props.getInputElement ? $props.getInputElement() : defaultInput;
      const inputCls = classnames(getClassFromVNode(inputElement), {
        [`${$props.prefixCls}-search__field`]: true
      });
      const inputEvents: any = getListenersFromVNode(inputElement);
      // https://github.com/ant-design/ant-design/issues/4992#issuecomment-281542159
      // Add space to the end of the inputValue as the width measurement tolerance
      inputElement.data = inputElement.data || {};
      return (
          <div class={`${$props.prefixCls}-search__field__wrap`} onClick={inputClick}>
            {cloneVNode(inputElement, {
              ...(inputElement.props || {}),
              disabled: $props.disabled,
              value: _inputValue.value,
              class: inputCls,
              ref: (el) => inputRef.value = el,
              onInput: onInputChange,
              onKeydown: chaining(
                  onInputKeydown,
                  inputEvents.onKeydown,
                  attrs.onInputKeydown
              ),
              onFocus: chaining(inputFocus, inputEvents.onFocus),
              onBlur: chaining(inputBlur, inputEvents.onBlur)
            })}
            <span
                ref={(el) => inputMirrorRef.value = el}
                // ref='inputMirrorRef'
                class={`${$props.prefixCls}-search__field__mirror`}>
              {_mirrorInputValue.value}&nbsp;
            </span>
          </div>
      );
    };
    const children = computed(() => {
      return $props.options ? $props.options.map(option => {
            const {key, label = option.title, on, class: cls, style, ...restOption} = option;
            return (
                <Option key={key} {...{props: restOption, on, class: cls, style}}>
                  {label}
                </Option>
            );
          })
          : filterEmpty(slots.default);
    });
    const openIfHasChildren = () => {
      if ((children.value && children.value.length) || isSingleMode($props)) {
        setOpenState(true);
      }
    };
    const isChildDisabled = (key) => {
      return (children.value || []).some(child => {
        const childValue = getValuePropValue(child);
        return childValue === key && getValue(child, 'disabled');
      });
    };
    const getLabelBySingleValue = (value, optionsInfo?) => {
      const {label} = getOptionInfoBySingleValue(value, optionsInfo);
      return label;
    };
    const getOptionBySingleValue = (value) => {
      const {option} = getOptionInfoBySingleValue(value);
      return option;
    };
    const removeSelected = (selectedKey, e?) => {
      if ($props.disabled || isChildDisabled(selectedKey)) {
        return;
      }
      // Do not trigger Trigger popup
      if (e && e.stopPropagation) {
        e.stopPropagation();
      }
      const oldValue = _value.value;
      const value = oldValue.filter(singleValue => {
        return singleValue !== selectedKey;
      });
      const canMultiple = isMultipleOrTags($props);

      if (canMultiple) {
        let event = selectedKey;
        if ($props.labelInValue) {
          event = {
            key: selectedKey,
            label: getLabelBySingleValue(selectedKey)
          };
        }
        emit('deselect', event, getOptionBySingleValue(selectedKey));
      }
      fireChange(value);
    };
    const _backfillValue = ref('');
    const handleBackfill = (item) => {
      if (!$props.backfill || !(isSingleMode($props) || isCombobox($props))) {
        return;
      }

      const key = getValuePropValue(item);

      if (isCombobox($props)) {
        setInputValue(key, false);
      }
      _value.value = [key];
      _backfillValue.value = key;
    };
    const rafInstance = ref(null);
    const cancelRafInstance = () => {
      if (rafInstance.value) {
        raf.cancel(rafInstance.value);
      }
    };
    const dropdownWidth = ref(0);
    const setDropdownWidth = () => {
      cancelRafInstance();
      rafInstance.value = raf(() => {
        if (selectionRef.value) {
          const width = selectionRef.value.offsetWidth;
          if (width !== dropdownWidth.value) {
            dropdownWidth.value = width;
          }
        }
      });
    };
    const onPlaceholderClick = () => {
      if (getInputDOMNode()) {
        getInputDOMNode().focus();
        setOpenState(true);
      }
    };
    const getPlaceholderElement = () => {
      let hidden = false;
      if (_mirrorInputValue.value) {
        hidden = true;
      }
      const value = _value.value;
      if (value.length) {
        hidden = true;
      }
      if (
          !_mirrorInputValue.value &&
          isCombobox($props) &&
          value.length === 1 &&
          _value.value &&
          !_value.value[0]
      ) {
        hidden = false;
      }
      const placeholder = $props.placeholder;
      if (placeholder) {
        const p = {
          onMousedown: preventDefaultEvent,
          onClick: onPlaceholderClick,
          style: {
            display: hidden ? 'none' : 'block'
          },
          class: `${$props.prefixCls}-selection__placeholder`
        };
        return <div {...p}>{placeholder}</div>;
      }
      return null;
    };
    const selectTriggerRef = ref(null);
    const comboboxTimer = ref(null);
    const onInputKeydown = (event) => {
      const {disabled, defaultActiveFirstOption} = $props;
      const combobox = isCombobox($props);
      if (disabled) {
        return;
      }
      const isRealOpen = getRealOpenState();
      const keyCode = event.keyCode;
      if (isMultipleOrTags($props) && !event.target.value && keyCode === KeyCode.BACKSPACE) {
        event.preventDefault();
        const value = _value.value;
        if (value.length) {
          removeSelected(value[value.length - 1]);
        }
        return;
      }
      if (keyCode === KeyCode.DOWN) {
        if (!_open.value) {
          openIfHasChildren();
          event.preventDefault();
          event.stopPropagation();
          return;
        }
      } else if (keyCode === KeyCode.ENTER && _open.value) {
        // Aviod trigger form submit when select item
        // https://github.com/ant-design/ant-design/issues/10861
        // https://github.com/ant-design/ant-design/issues/14544
        if (isRealOpen || !combobox) {
          event.preventDefault();
        }
        // Hard close popup to avoid lock of non option in combobox mode
        if (isRealOpen && combobox && defaultActiveFirstOption === false) {
          comboboxTimer.value = setTimeout(() => {
            setOpenState(false);
          });
        }
      } else if (keyCode === KeyCode.ESC) {
        if (_open.value) {
          setOpenState(false);
          event.preventDefault();
          event.stopPropagation();
        }
        return;
      }

      if (isRealOpen && selectTriggerRef.value) {
        const menu = menuRef.value;
        if (menu && menu.onKeyDown(event, handleBackfill)) {
          event.preventDefault();
          event.stopPropagation();
        }
      }
    };

    const getVLForOnChange = (vlsS) => {
      let vls = vlsS;
      if (vls !== undefined) {
        if (!$props.labelInValue) {
          vls = vls.map(v => v);
        } else {
          vls = vls.map(vl => ({
            key: vl,
            label: getLabelBySingleValue(vl)
          }));
        }
        return isMultipleOrTags($props) ? vls : vls[0];
      }
      return vls;
    };
    const topCtrlContainerClick = (e) => {
      if (_open.value && !isSingleMode($props)) {
        e.stopPropagation();
      }
    };
    const renderTopControlNode = () => {
      const {
        choiceTransitionName,
        prefixCls,
        maxTagTextLength,
        maxTagCount,
        maxTagPlaceholder,
        showSearch
      } = $props;
      const removeIcon = getComponentFromProp(getCurrentInstance(), 'removeIcon');
      const className = `${prefixCls}-selection__rendered`;
      // search input is inside topControlNode in single, multiple & combobox. 2016/04/13
      let innerNode;
      if (isSingleMode($props)) {
        let selectedValue = null;
        if (_value.value.length) {
          let showSelectedValue;
          let opacity = 1;
          if (!showSearch) {
            showSelectedValue = true;
          } else if (_open) {
            showSelectedValue = !_inputValue;
            if (showSelectedValue) {
              opacity = 0.4;
            }
          } else {
            showSelectedValue = true;
          }
          const singleValue = _value.value[0];
          const {label, title} = getOptionInfoBySingleValue(singleValue);
          selectedValue = (
              <div
                  key="value"
                  class={`${prefixCls}-selection-selected-value`}
                  title={toTitle(title || label)}
                  style={{
                    display: showSelectedValue ? 'block' : 'none',
                    opacity
                  }}
              >
                {label}
              </div>
          );
        }
        if (!showSearch) {
          innerNode = [selectedValue];
        } else {
          innerNode = [
            selectedValue,
            <div
                class={`${prefixCls}-search ${prefixCls}-search--inline`}
                key="input"
                style={{
                  display: _open ? 'block' : 'none'
                }}
            >
              {_getInputElement()}
            </div>
          ];
        }
      } else {
        let selectedValueNodes = [];
        let limitedCountValue = _value.value;
        let maxTagPlaceholderEl;
        if (maxTagCount !== undefined && _value.value.length > maxTagCount) {
          limitedCountValue = limitedCountValue.slice(0, maxTagCount);
          const omittedValues = getVLForOnChange(_value.value.slice(maxTagCount, _value.value.length));
          let content = `+ ${_value.value.length - maxTagCount} ...`;
          if (maxTagPlaceholder) {
            content =
                typeof maxTagPlaceholder === 'function'
                    ? maxTagPlaceholder(omittedValues)
                    : maxTagPlaceholder;
          }
          const attrs = {
            // ...UNSELECTABLE_ATTRIBUTE,
            role: 'presentation',
            title: toTitle(content)
          };
          maxTagPlaceholderEl = (
              <li {...attrs}
                  onMousedown={preventDefaultEvent}
                  class={`${prefixCls}-selection__choice ${prefixCls}-selection__choice__disabled`}
                  key="maxTagPlaceholder">
                <div class={`${prefixCls}-selection__choice__content`}>{content}</div>
              </li>
          );
        }
        if (isMultipleOrTags($props)) {
          selectedValueNodes = limitedCountValue.map(singleValue => {
            const info = getOptionInfoBySingleValue(singleValue);
            let content = info.label;
            const title = info.title || content;
            if (
                maxTagTextLength &&
                typeof content === 'string' &&
                content.length > maxTagTextLength
            ) {
              content = `${content.slice(0, maxTagTextLength)}...`;
            }
            const disabled = isChildDisabled(singleValue);
            const choiceClassName = disabled
                ? `${prefixCls}-selection__choice ${prefixCls}-selection__choice__disabled`
                : `${prefixCls}-selection__choice`;
            // attrs 放在一起，避免动态title混乱问题，很奇怪的问题 https://github.com/vueComponent/ant-design-vue/issues/588
            const attrs = {
              // ...UNSELECTABLE_ATTRIBUTE,
              role: 'presentation',
              title: toTitle(title)
            };
            return (
                <li {...attrs}
                    onMousedown={preventDefaultEvent}
                    class={choiceClassName}
                    key={singleValue || SELECT_EMPTY_VALUE_KEY}
                >
                  <div class={`${prefixCls}-selection__choice__content`}>{content}</div>
                  {disabled ? null : (
                      <span
                          onClick={event => {
                            removeSelected(singleValue, event);
                          }}
                          class={`${prefixCls}-selection__choice__remove`}>
                        {removeIcon || <i class={`${prefixCls}-selection__choice__remove-icon`}>×</i>}
                      </span>
                  )}
                </li>
            );
          });
        }
        if (maxTagPlaceholderEl) {
          selectedValueNodes.push(maxTagPlaceholderEl);
        }
        selectedValueNodes.push(
            <li class={`${prefixCls}-search ${prefixCls}-search--inline`} key="__input">
              {_getInputElement()}
            </li>
        );
        if (isMultipleOrTags($props) && choiceTransitionName) {
          const transitionProps = getTransitionProps(choiceTransitionName, {
            tag: 'ul'
          });
          innerNode = (
              // @ts-ignore
              <TransitionGroup {...transitionProps}>{selectedValueNodes}</TransitionGroup>
          );
        } else {
          innerNode = <ul>{selectedValueNodes}</ul>;
        }
      }
      return (
          <div
              class={className}
              ref={(el) => topCtrlRef.value = el}
              onClick={topCtrlContainerClick}
          >
            {getPlaceholderElement()}
            {innerNode}
          </div>
      );
    };
    const getRealOpenState = () => {
      if (typeof $props.open === 'boolean') {
        return $props.open;
      }
      let open = _open.value;
      const options = _options.value || [];
      if (isMultipleOrTagsOrCombobox($props) || !$props.showSearch) {
        if (open && !options.length) {
          open = false;
        }
      }
      return open;
    };
    const getOptionsBySingleValue = (values) => {
      return values.map(value => {
        return getOptionBySingleValue(value);
      });
    };
    const fireChange = (value) => {
      if ($props.value === undefined) {
        _value.value = value;
      }
      const vls = getVLForOnChange(value);
      const options = getOptionsBySingleValue(value);
      _emit('change', vls, isMultipleOrTags($props) ? options : options[0]);
      _emit('update:value', vls);
    };
    const onClearSelection = (event) => {
      if ($props.disabled) {
        return;
      }
      event.stopPropagation();
      if (_inputValue.value || _value.value.length) {
        if (_value.value.length) {
          fireChange([]);
        }
        setOpenState(false, {needFocus: true});
        if (_inputValue.value) {
          setInputValue('');
        }
      }
    };
    const setInputValue = (inputValue, fireSearch = true) => {
      if (inputValue !== _inputValue.value) {
        _inputValue.value = inputValue;
        if (fireSearch) {
          emit('search', inputValue);
        }
      }
    };
    const selectionRef = ref(null);
    const maybeFocus = (open: boolean, needFocus?: boolean) => {
      if (needFocus || open) {
        const input = getInputDOMNode();
        const {activeElement} = document;
        if (input && (open || isMultipleOrTagsOrCombobox($props))) {
          if (activeElement !== input) {
            input.focus();
            _focused.value = true;
          }
        } else if (activeElement !== selectionRef.value && selectionRef.value) {
          selectionRef.value.focus();
          _focused.value = true;
        }
      }
    };
    const setOpenState = (open: boolean, config: any = {}) => {
      const {needFocus, fireSearch} = config;
      if (_open.value === open) {
        maybeFocus(open, !!needFocus);
        return;
      }
      emit('dropdownVisibleChange', open);
      // clear search input value when open is false in singleMode.
      if (!open && isSingleMode($props) && $props.showSearch) {
        setInputValue('', fireSearch);
      }
      if (!open) {
        maybeFocus(open, !!needFocus);
      }
      _open.value = open;
      _backfillValue.value = '';
      if (open) {
        maybeFocus(open, !!needFocus);
      }
    };
    const renderClear = () => {
      const {prefixCls, allowClear} = $props;
      const clearIcon = getComponentFromProp(getCurrentInstance(), 'clearIcon');
      const clear = (
          <span
              key="clear"
              class={`${prefixCls}-selection__clear`}
              onMousedown={preventDefaultEvent}
              {...{attrs: UNSELECTABLE_ATTRIBUTE}}
              onClick={onClearSelection}>
            {clearIcon || <i class={`${prefixCls}-selection__clear-icon`}>×</i>}
          </span>
      );
      if (!allowClear) {
        return null;
      }
      if (isCombobox($props)) {
        if (_inputValue.value) {
          return clear;
        }
        return null;
      }
      if (_inputValue.value || _value.value.length) {
        return clear;
      }
      return null;
    };
    const defaultFilterFn = (input, child) => {
      const props = getPropsData(child);
      if (props.disabled) {
        return false;
      }
      let value = getPropValue(child, props.optionFilterProp);
      if (value.length && value[0].text) {
        value = value[0].text;
      } else {
        value = String(value);
      }
      return value.toLowerCase().indexOf(input.toLowerCase()) > -1;
    };
    const _filterOption = (input, child, defaultFilter = defaultFilterFn) => {
      const lastValue = _value.value[_value.value.length - 1];
      if (!input || (lastValue && lastValue === _backfillValue.value)) {
        return true;
      }
      let filterFn = $props.filterOption;
      if (filterFn !== undefined) {
        if (filterFn === true) {
          filterFn = defaultFilter.bind(currentInstance);
        }
      } else {
        filterFn = defaultFilter.bind(currentInstance);
      }
      if (!filterFn) {
        return true;
      } else if (typeof filterFn === 'function') {
        return filterFn.call(currentInstance, input, child);
      } else if (getValue(child, 'disabled')) {
        return false;
      }
      return true;
    };
    const renderFilterOptionsFromChildren = (children = [], childrenKeys, menuItems) => {
      const sel = [];
      const tags = $props.mode === 'tags';
      children.forEach(child => {
        if (!Array.isArray(child.children) && !child.children.default) {
          return;
        }
        if (getSlotOptions(child).isSelectOptGroup) {
          let label = getComponentFromProp(child, 'label');
          let key = child.key;
          if (!key && typeof label === 'string') {
            key = label;
          } else if (!label && key) {
            label = key;
          }
          let childChildren = getSlots(child).default();
          childChildren = typeof childChildren === 'function' ? childChildren() : childChildren;
          // Match option group label
          if (_inputValue.value && _filterOption(_inputValue, child)) {
            const innerItems = childChildren.map(subChild => {
              const childValueSub = getValuePropValue(subChild) || subChild.key;
              return (
                  <MenuItem key={childValueSub} value={childValueSub} {...subChild.props}>
                    {subChild.children}
                  </MenuItem>
              );
            });

            sel.push(
                <MenuItemGroup key={key} title={label} class={getClassFromVNode(child)}>
                  {innerItems}
                </MenuItemGroup>
            );
            // Not match
          } else {
            const innerItems = renderFilterOptionsFromChildren(
                childChildren,
                childrenKeys,
                menuItems
            );
            if (innerItems.length) {
              sel.push(
                  <MenuItemGroup key={key} title={label} {...child.data}>
                    {innerItems}
                  </MenuItemGroup>
              );
            }
          }
          return;
        }
        const childValue = getValuePropValue(child);
        validateOptionValue(childValue, $props);
        if (_filterOption(_inputValue.value, child)) {
          const p = {
            ...UNSELECTABLE_ATTRIBUTE,
            ...getAttrs(child),
            key: childValue,
            value: childValue,
            ...getPropsData(child),
            role: 'option',
            style: UNSELECTABLE_STYLE,
            ...getListenersFromVNode(child),
            rootPrefixCls: dropdownClassPrefix.value + '-menu',
            class: getClassFromVNode(child)
          };
          const menuItem = <MenuItem {...p}>{
            Array.isArray(child.children) ? child.children
                : child.children.default && child.children.default()
          }</MenuItem>;
          sel.push(menuItem);
          menuItems.push(menuItem);
        }
        if (tags) {
          childrenKeys.push(childValue);
        }
      });
      return sel;
    };
    const tags = computed(() => $props.mode === 'tags');
    const renderFilterOptions = () => {
      const {notFoundContent} = $props;
      const menuItems = [];
      const childrenKeys = [];
      let empty = false;
      let options = renderFilterOptionsFromChildren(children.value, childrenKeys, menuItems);
      if (tags.value) {
        // tags value must be string
        let value = _value.value;
        value = value.filter(singleValue => {
          return (
              childrenKeys.indexOf(singleValue) === -1 &&
              (!_inputValue.value || String(singleValue).indexOf(String(_inputValue)) > -1)
          );
        });

        // sort by length
        value.sort((val1, val2) => {
          return val1.length - val2.length;
        });

        value.forEach(singleValue => {
          const key = singleValue;
          const attrs = {
            ...UNSELECTABLE_ATTRIBUTE,
            role: 'option'
          };
          const menuItem = (
              <MenuItem style={UNSELECTABLE_STYLE} {...attrs} value={key} key={key}>
                {key}
              </MenuItem>
          );
          options.push(menuItem);
          menuItems.push(menuItem);
        });
        // ref: https://github.com/ant-design/ant-design/issues/14090
        if (_inputValue.value && menuItems.every(option => getValuePropValue(option) !== _inputValue)) {
          const p = {
            ...UNSELECTABLE_ATTRIBUTE,
            key: _inputValue.value,
            value: _inputValue.value,
            role: 'option',
            style: UNSELECTABLE_STYLE
          };
          options.unshift(<MenuItem {...p}>{_inputValue.value}</MenuItem>);
        }
      }
      if (!options.length && notFoundContent) {
        empty = true;
        const p = {
          attrs: UNSELECTABLE_ATTRIBUTE,
          key: 'NOT_FOUND',
          value: 'NOT_FOUND',
          disabled: true,
          role: 'option',
          style: UNSELECTABLE_STYLE
        };
        options = [<MenuItem {...p}>{notFoundContent}</MenuItem>];
      }
      return {empty, options};
    };
    const getMenuItemSelectedIcon = () => {
      const menuItemSelectedIcon = getComponentFromProp(currentInstance, 'menuItemSelectedIcon');
      return (menuItemSelectedIcon &&
          (isValidElement(menuItemSelectedIcon)
              ? cloneVNode(menuItemSelectedIcon, {class: `${$props.prefixCls}-selected-icon`})
              : menuItemSelectedIcon)) || <Icon type="check" class={`${$props.prefixCls}-selected-icon`}/>;
    };
    const menuRef = ref(null);
    const onMenuDeselect = ({item, domEvent}) => {
      if (domEvent.type === 'keydown' && domEvent.keyCode === KeyCode.ENTER) {
        const menuItemDomNode = item.$el;
        // https://github.com/ant-design/ant-design/issues/20465#issuecomment-569033796
        if (!isHidden(menuItemDomNode)) {
          removeSelected(getValuePropValue(item));
        }
        return;
      }
      if (domEvent.type === 'click') {
        removeSelected(getValuePropValue(item));
      }
      if ($props.autoClearSearchValue) {
        setInputValue('');
      }
    };
    const renderMenu = () => {
      const menuItems = _options.value;
      const {
        defaultActiveFirstOption,
        value,
        firstActiveValue,
        dropdownMenuStyle
      } = $props;
      const {popupScroll} = getListenersFromInstance(currentInstance);
      if (menuItems && menuItems.length) {
        const selectedKeys = getSelectKeys(menuItems, _value.value);
        const menuItemSelectedIcon = getMenuItemSelectedIcon();
        const menuProps: any = {
          multiple: !isSingleMode($props),
          itemIcon: !isSingleMode($props) ? menuItemSelectedIcon : null,
          selectedKeys,
          prefixCls: `${dropdownClassPrefix.value}-menu`,
          style: dropdownMenuStyle,
          ref: (el) => menuRef.value = el,
          role: 'listbox'
        };
        if (popupScroll) {
          menuProps.onScroll = popupScroll;
        }
        if (!isSingleMode($props)) {
          menuProps.onDeselect = onMenuDeselect;
          menuProps.onSelect = onMenuSelect;
        } else {
          menuProps.onClick = onMenuSelect;
        }
        const activeKeyProps: { activeKey?: string } = {};

        let defaultActiveFirst = defaultActiveFirstOption;
        let clonedMenuItems = menuItems;
        if (selectedKeys.length || firstActiveValue) {
          if (_open.value) {
            activeKeyProps.activeKey = selectedKeys[0] || firstActiveValue;
          } else if (!_open.value) {
            // Do not trigger auto active since we already have selectedKeys
            if (selectedKeys[0]) {
              defaultActiveFirst = false;
            }
            activeKeyProps.activeKey = undefined;
          }
          let foundFirst = false;
          // set firstActiveItem via cloning menus
          // for scroll into view
          const clone = item => {
            if (
                (!foundFirst && selectedKeys.indexOf(item.key) !== -1) ||
                (!foundFirst && !selectedKeys.length && firstActiveValue.indexOf(item.key) !== -1)
            ) {
              foundFirst = true;
              return cloneVNode(item, {
                ref: ref => {
                  firstActiveItem.value = ref;
                }
              });
            }
            return item;
          };

          clonedMenuItems = menuItems.map(item => {
            if (getSlotOptions(item).isMenuItemGroup) {
              return cloneVNode(item, {children: item.componentOptions.children.map(clone)});
            }
            return clone(item);
          });
        } else {
          // Clear firstActiveItem when dropdown menu items was empty
          // Avoid `Unable to find node on an unmounted component`
          // https://github.com/ant-design/ant-design/issues/10774
          firstActiveItem.value = null;
        }

        // clear activeKey when inputValue change
        const lastValue = value && value[value.length - 1];
        if ((!lastValue || lastValue !== _backfillValue.value)) {
          activeKeyProps.activeKey = '';
        }
        Object.assign(menuProps, activeKeyProps, {defaultActiveFirst});
        return <Menu {...menuProps}>{clonedMenuItems}</Menu>;
      }
      return null;
    };
    const arrowRef = ref(null);
    const blurTimer = ref(null);
    const onArrowClick = (e) => {
      e.stopPropagation();
      e.preventDefault();
      clearBlurTime();
      if (!$props.disabled) {
        setOpenState(!_open.value, {needFocus: !_open.value});
      }
    };
    const clearBlurTime = () => {
      if (blurTimer.value) {
        clearTimeout(blurTimer.value);
        blurTimer.value = null;
      }
    };
    const renderArrow = (multiple) => {
      // showArrow : Set to true if not multiple by default but keep set value.
      const {showArrow = !multiple, loading, prefixCls} = $props;
      const inputIcon = getComponentFromProp(currentInstance, 'inputIcon');
      if (!showArrow && !loading) {
        return null;
      }
      // if loading  have loading icon
      const defaultIcon = loading ? (
          <Icon type="loading" class={`${prefixCls}-arrow-loading`}/>
      ) : (
          <Icon type="down" class={`${prefixCls}-arrow-icon`}/>
      );
      return (
          <span
              key="arrow"
              class={`${prefixCls}-arrow`}
              onClick={onArrowClick}
              ref={(el) => arrowRef.value = el}>
            {inputIcon || defaultIcon}
          </span>
      );
    };
    const onMenuSelect = ({item}) => {
      if (!item) {
        return;
      }
      const selectedValue = getValuePropValue(item);
      const lastValue = _value[_value.value.length - 1];
      let skipTrigger = false;

      if (isMultipleOrTags($props)) {
        if (findIndexInValueBySingleValue(_value, selectedValue) !== -1) {
          skipTrigger = true;
        } else {
          _value.value = _value.value.concat([selectedValue]);
        }
      } else {
        if (
            !isCombobox($props) &&
            lastValue !== undefined &&
            lastValue === selectedValue &&
            selectedValue !== _backfillValue.value
        ) {
          setOpenState(false, {needFocus: true, fireSearch: false});
          skipTrigger = true;
        } else {
          _value.value = [selectedValue];
          setOpenState(false, {needFocus: true, fireSearch: false});
        }
      }
      if (!skipTrigger) {
        fireChange(_value.value);
      }
      if (!skipTrigger) {
        fireSelect(selectedValue);
        const inputValue = isCombobox($props) ? getPropValue(item, getOptionLabelProp()) : '';
        if ($props.autoClearSearchValue) {
          setInputValue(inputValue, false);
        }
      }
    };
    const dropdownClassPrefix = computed(() => $props.prefixCls + '-dropdown');
    const onPopupFocus = () => {
      // fix ie scrollbar, focus element again
      maybeFocus(true, true);
    };
    const getPopupAlign = () => {
      return getAlignFromPlacement(BUILT_IN_PLACEMENTS, 'bottomLeft');
    };
    const getDropdownClass = () => {
      return {
        [dropdownClassPrefix.value]: true,
        [dropdownClassPrefix.value + '--single']: isSingleMode($props),
        [dropdownClassPrefix.value + '--multiple']: !isSingleMode($props),
        [dropdownClassPrefix.value + '--placement-' + 'bottomLeft']: true
      };
    };
    const selectionRefClick = () => {
      if (!$props.disabled) {
        const input = getInputDOMNode();
        if (_focused.value && _open.value) {
          setOpenState(false, false);
          input && input.blur();
        } else {
          clearBlurTime();
          setOpenState(true, true);
          input && input.focus();
        }
      }
    };
    const onDropdownVisibleChange = (open, e) => {
      if (contains(rootRef.value, e.target)) {
        return;
      }
      if (open && !_focused.value) {
        clearBlurTime();
        timeoutFocus();
        _focused.value = true;
        updateFocusClassName();
      }
      setOpenState(open);
    };
    const hideAction = computed(() => {
      let hide;
      if ($props.disabled) {
        hide = [];
      } else if (isSingleMode($props) && !$props.showSearch) {
        hide = ['click'];
      } else {
        hide = ['blur'];
      }
      return hide;
    });
    const menuContainerRef = ref(null);
    const getInputMirrorDOMNode = () => {
      return inputMirrorRef.value;
    };
    onMounted(() => {
      setDropdownWidth();
    });
    onUpdated(() => {
      nextTick(() => {
        if (isMultipleOrTags($props)) {
          const inputNode = getInputDOMNode();
          const mirrorNode = getInputMirrorDOMNode();
          if (inputNode && inputNode.value && mirrorNode) {
            inputNode.style.width = '';
            inputNode.style.width = `${mirrorNode.clientWidth + 10}px`;
          } else if (inputNode) {
            inputNode.style.width = '';
          }
        }
        if (selectTriggerRef.value) {
          selectTriggerRef.value.forcePopupAlign();
        }
      });
      setDropdownWidth();
    });
    watch(() => _inputValue.value, (val) => {
      _mirrorInputValue.value = val;
    });
    return {
      _open,
      _focused,
      dropdownWidth,
      getRealOpenState,
      onDropdownVisibleChange,
      renderClear,
      renderArrow,
      renderTopControlNode,
      selectionRefClick,
      getPopupAlign,
      rootRef,
      renderMenu,
      onPopupFocus,
      renderFilterOptions,
      getDropdownClass,
      dropdownClassPrefix,
      hideAction,
      saveRootRef: (el) => {
        rootRef.value = el;
      },
      saveSelectionRef: (el) => {
        selectionRef.value = el;
      },
      onPopupScroll: (...args) => {
        emit('popupScroll', ...args);
      },
      setOptions(options) {
        _options.value = options;
      },
      saveMenuContainer(el) {
        menuContainerRef.value = el;
      },
      setTriggerRef(el) {
        selectTriggerRef.value = el;
      }
    };
  },
  render(ctx) {
    const {
      prefixCls, showArrow = true, tabIndex, getRealOpenState,
      combobox, loading = false, disabled, allowClear, _focused
    } = ctx;
    const filterOptions = ctx.renderFilterOptions();
    ctx.setOptions(filterOptions.options);
    const ctrlNode = ctx.renderTopControlNode();
    const props = ctx.$props;
    const realOpen = getRealOpenState();
    const selectionProps = {
      role: 'combobox',
      key: 'selection',
      class: `${prefixCls}-selection ${prefixCls}-selection--${isSingleMode(props) ? 'single' : 'multiple'}`
    };
    if (realOpen) {
      ctx._empty = filterOptions.empty;
    }
    const rootCls = {
      [prefixCls]: true,
      [`${prefixCls}-open`]: realOpen,
      [`${prefixCls}-focused`]: realOpen || _focused.value,
      [`${prefixCls}-combobox`]: combobox,
      [`${prefixCls}-disabled`]: disabled,
      [`${prefixCls}-enabled`]: !disabled,
      [`${prefixCls}-allow-clear`]: !!allowClear,
      [`${prefixCls}-no-arrow`]: !showArrow,
      [`${prefixCls}-loading`]: !!loading
    };
    const transitionProps = {
      props: {
        appear: true,
        css: false
      }
    };
    const transitionName = 'slide-up';
    const transitionEvent = {
      onBeforeEnter: () => {
        // el.style.display = el.__vOriginalDisplay
        // this.$refs.alignInstance.forceAlign();
      },
      onEnter: (el, done) => {
        // render 后 vue 会移除通过animate动态添加的 class导致动画闪动，延迟两帧添加动画class，可以进一步定位或者重写 transition 组件
        nextTick(() => {
          if (ctx.$refs.alignInstance) {
            nextTick(() => {
              animate(el, `${transitionName}-enter`, done);
            });
          } else {
            done();
          }
        });
      },
      onLeave: (el, done) => {
        animate(el, `${transitionName}-leave`, done);
      }
    };
    Object.assign(transitionProps, transitionEvent);
    const dropdown = ctx.renderMenu();
    const popupStyle = {...props.dropdownStyle};
    const widthProp = props.dropdownMatchSelectWidth ? 'width' : 'minWidth';
    if (ctx.dropdownWidth) {
      popupStyle[widthProp] = `${ctx.dropdownWidth}px`;
    }
    const triggerProps = {
      showAction: disabled ? [] : props.showAction,
      hideAction: ctx.hideAction,
      ref: ctx.setTriggerRef,
      popupPlacement: 'bottomLeft',
      builtinPlacements: BUILT_IN_PLACEMENTS,
      prefixCls: ctx.dropdownClassPrefix,
      popupClassName: ctx.getDropdownClass(),
      popupTransitionName: 'slide-up',
      popupAlign: ctx.getPopupAlign(),
      popupVisible: realOpen,
      popupStyle,
      onPopupVisibleChange: ctx.onDropdownVisibleChange
    };
    return (
        <Trigger {...triggerProps}>
          <div
              ref={(el) => {
                ctx.saveRootRef(el);
                ctx.saveSelectionRef(el);
              }}
              style={getStyleFromInstance(getCurrentInstance())}
              class={classnames(rootCls)}
              onMousedown={ctx.markMouseDown}
              onMouseup={ctx.markMouseLeave}
              onMouseout={ctx.markMouseLeave}
              tabindex={disabled ? -1 : tabIndex}
              onBlur={ctx.selectionRefBlur}
              onFocus={ctx.selectionRefFocus}
              onClick={ctx.selectionRefClick}
              onKeydown={isMultipleOrTagsOrCombobox(ctx) ? () => {
              } : ctx.onKeyDown}>
            <div {...selectionProps}>
              {ctrlNode}
              {ctx.renderClear()}
              {ctx.renderArrow(!isSingleMode(props))}
            </div>
          </div>
          {
            // @ts-ignore
            <template slot="popup">
              <Transition {...transitionProps}>
                {dropdown}
              </Transition>
            </template>
          }
        </Trigger>
    );
  }
}) as any;

/* istanbul ignore next */
Select.install = function(app: App) {
  app.use(Base);
  app.component(Select.name, Select);
  app.component(Select.Option.name, Select.Option);
  app.component(Select.OptGroup.name, Select.OptGroup);
};

export default Select;
