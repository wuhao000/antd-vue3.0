import classnames from 'classnames';
import classes from 'component-classes';
import {defineComponent, getCurrentInstance, ref} from 'vue';
import BaseMixin from '../_util/base-mixin';
import {isEdge, isIE} from '../_util/env';
import getTransitionProps from '../_util/getTransitionProps';
import KeyCode from '../_util/KeyCode';
import {
  getAttrs,
  getClass,
  getComponentFromProp,
  getEvents,
  getListeners,
  getOptionProps,
  getPropsData,
  getSlotOptions,
  getSlots,
  getStyle,
  getValueByProp as getValue,
  hasProp
} from '../_util/props-util';
import proxyComponent from '../_util/proxyComponent';
import {cloneElement} from '../_util/vnode';
import PropTypes from '../_util/vue-types';
import {Item as MenuItem, ItemGroup as MenuItemGroup} from '../vc-menu';
import contains from '../vc-util/Dom/contains';
import OptGroup from './OptGroup';
import Option from './Option';
import {SelectPropTypes} from './PropTypes';
import SelectTrigger from './select-trigger';
import {
  defaultFilterFn,
  findFirstMenuItem,
  findIndexInValueBySingleValue,
  generateUUID,
  getLabelFromPropsValue,
  getMapKey,
  getPropValue,
  getValuePropValue,
  includesSeparators,
  isCombobox,
  isMultipleOrTags,
  isMultipleOrTagsOrCombobox,
  isSingleMode,
  preventDefaultEvent,
  saveRef,
  splitBySeparators,
  toArray,
  toTitle,
  UNSELECTABLE_ATTRIBUTE,
  UNSELECTABLE_STYLE,
  validateOptionValue
} from './util';

const SELECT_EMPTY_VALUE_KEY = 'RC_SELECT_EMPTY_VALUE_KEY';

const noop = () => null;

// Where el is the DOM element you'd like to test for visibility
function isHidden(node) {
  return !node || node.offsetParent === null;
}

function chaining(...fns) {
  return function(...args) {
    // eslint-disable-line
    // eslint-disable-line
    for (let i = 0; i < fns.length; i++) {
      if (fns[i] && typeof fns[i] === 'function') {
        fns[i].apply(chaining, args);
      }
    }
  };
}

const Select = defineComponent({
  inheritAttrs: false,
  Option,
  OptGroup,
  name: 'Select',
  props: {
    ...SelectPropTypes,
    prefixCls: SelectPropTypes.prefixCls.def('rc-select'),
    defaultOpen: PropTypes.bool.def(false),
    labelInValue: SelectPropTypes.labelInValue.def(false),
    defaultActiveFirstOption: SelectPropTypes.defaultActiveFirstOption.def(true),
    showSearch: SelectPropTypes.showSearch.def(true),
    allowClear: SelectPropTypes.allowClear.def(false),
    placeholder: SelectPropTypes.placeholder.def(''),
    // showArrow: SelectPropTypes.showArrow.def(true),
    dropdownMatchSelectWidth: PropTypes.bool.def(true),
    dropdownStyle: SelectPropTypes.dropdownStyle.def(() => ({})),
    dropdownMenuStyle: PropTypes.object.def(() => ({})),
    optionFilterProp: SelectPropTypes.optionFilterProp.def('value'),
    optionLabelProp: SelectPropTypes.optionLabelProp.def('value'),
    notFoundContent: PropTypes.any.def('Not Found'),
    backfill: PropTypes.bool.def(false),
    showAction: SelectPropTypes.showAction.def(['click']),
    combobox: PropTypes.bool.def(false),
    tokenSeparators: PropTypes.arrayOf(PropTypes.string).def([]),
    autoClearSearchValue: PropTypes.bool.def(true),
    tabIndex: PropTypes.any.def(0),
    dropdownRender: PropTypes.func.def(menu => menu)
    // onChange: noop,
    // onFocus: noop,
    // onBlur: noop,
    // onSelect: noop,
    // onSearch: noop,
    // onDeselect: noop,
    // onInputKeydown: noop,
  },
  model: {
    prop: 'value',
    event: 'change'
  },
  setup(props, {attrs, emit}) {
    const selectTriggerRef = ref(null);
    const getLabelFromOption = (props, option) => {
      return getPropValue(option, props.optionLabelProp);
    }
    const getOptionsFromChildren = (children = [], options = []) => {
      children.forEach(child => {
        if (!child.data || child.data.slot !== undefined) {
          return;
        }
        if (getSlotOptions(child).isSelectOptGroup) {
          getOptionsFromChildren(child.componentOptions.children, options);
        } else {
          options.push(child);
        }
      });
      return options;
    }
    const getInputValueForCombobox = (props, optionsInfo, useDefaultValue) => {
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
    }
    const getRealOpenState = () => {
      const _open = props.open;
      if (typeof _open === 'boolean') {
        return _open;
      }

      let open = _open.value;
      const options = _options.value || [];
      if (isMultipleOrTagsOrCombobox(props) || !props.showSearch) {
        if (open && !options.length) {
          open = false;
        }
      }
      return open;
    }
    const isChildDisabled = (key) => {
      return (props.children || []).some(child => {
        const childValue = getValuePropValue(child);
        return childValue === key && getValue(child, 'disabled');
      });
    }
    const removeSelected = (selectedKey, e?) => {
      if (props.disabled || isChildDisabled(selectedKey)) {
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
      const canMultiple = isMultipleOrTags(props);

      if (canMultiple) {
        let event = selectedKey;
        if (props.labelInValue) {
          event = {
            key: selectedKey,
            label: getLabelBySingleValue(selectedKey)
          };
        }
        emit('deselect', event, getOptionBySingleValue(selectedKey));
      }
      fireChange(value);
    }
    const openIfHasChildren = () => {
      if ((props.children && props.children.length) || isSingleMode(props)) {
        setOpenState(true);
      }
    }
    const comboboxTimer = ref(null)
    const handleBackfill = (item) => {
      if (!props.backfill || !(isSingleMode(props) || isCombobox(props))) {
        return;
      }

      const key = getValuePropValue(item);

      if (isCombobox(props)) {
        setInputValue(key, false);
      }
      _value.value = [key];
      _backfillValue.value = key;
    }
    const onInputKeydown = (event) => {
      const {disabled, combobox, defaultActiveFirstOption} = props;
      if (disabled) {
        return;
      }
      const isRealOpen = getRealOpenState();
      const keyCode = event.keyCode;
      if (isMultipleOrTags(props) && !event.target.value && keyCode === KeyCode.BACKSPACE) {
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
        const menu = selectTriggerRef.value.getInnerMenu();
        if (menu && menu.onKeyDown(event, handleBackfill)) {
          event.preventDefault();
          event.stopPropagation();
        }
      }
    }
    const forcePopupAlign = () => {
      if (!_open.value) {
        return;
      }
      if (selectTriggerRef.value && selectTriggerRef.value.triggerRef) {
        selectTriggerRef.triggerRef.forcePopupAlign();
      }
    }
    const getOptionsInfoFromProps = (props, preState: any = null) => {
      const options = getOptionsFromChildren(props.children);
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
        const oldOptionsInfo = preState._optionsInfo;
        const value = preState._value;
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
    }
    const setInputValue = (inputValue, fireSearch = true) => {
      if (inputValue !== _inputValue.value) {
        _inputValue.value = inputValue;
        forcePopupAlign();
        if (fireSearch) {
          emit('search', inputValue);
        }
      }
    }
    const optionsInfo = getOptionsInfoFromProps(props);
    const getOptionsBySingleValue = (values) => {
      return values.map(value => {
        return getOptionBySingleValue(value);
      });
    }
    const getOptionInfoBySingleValue = (value, optionsInfo?) => {
      let info;
      optionsInfo = optionsInfo || _optionsInfo.value;
      if (optionsInfo[getMapKey(value)]) {
        info = optionsInfo[getMapKey(value)];
      }
      if (info) {
        return info;
      }
      let defaultLabel = value;
      if (props.labelInValue) {
        const valueLabel = getLabelFromPropsValue(props.value, value);
        const defaultValueLabel = getLabelFromPropsValue(props.defaultValue, value);
        if (valueLabel !== undefined) {
          defaultLabel = valueLabel;
        } else if (defaultValueLabel !== undefined) {
          defaultLabel = defaultValueLabel;
        }
      }
      const defaultInfo = {
        option: (
          <Option value={value} key={value}>
            {value}
          </Option>
        ),
        value,
        label: defaultLabel
      };
      return defaultInfo;
    }
    const getOptionBySingleValue = (value) => {
      const {option} = getOptionInfoBySingleValue(value);
      return option;
    }
    const getValueFromProps = (props, useDefaultValue) => {
      let value = [];
      if ('value' in props && !useDefaultValue) {
        value = toArray(props.value);
      }
      if ('defaultValue' in props && useDefaultValue) {
        value = toArray(props.defaultValue);
      }
      if (props.labelInValue) {
        value = value.map(v => {
          return v.key;
        });
      }
      return value;
    }
    const inputFocus = (e) => {
      if (props.disabled) {
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
      const inputNode = this.getInputDOMNode();
      if (inputNode && e.target === this.rootRef) {
        return;
      }
      if (!isMultipleOrTagsOrCombobox(this.$props) && e.target === inputNode) {
        return;
      }
      if (this._focused) {
        return;
      }
      this._focused = true;
      this.updateFocusClassName();
      // only effect multiple or tag mode
      if (!isMultipleOrTags(this.$props) || !this._mouseDown) {
        this.timeoutFocus();
      }
    }
    const _options = ref([]);
    const _open = ref(props.defaultOpen);
    const _backfillValue = ref('');
    const _focused = ref(false);
    const _skipBuildOptionsInfo = ref(true);
    const _ariaId = ref(generateUUID())
    const _value = ref(getValueFromProps(props, true));
    const _optionsInfo = ref(optionsInfo)
    const _inputValue = ref(props.combobox
      ? getInputValueForCombobox(
        props,
        optionsInfo,
        true // use default value
      )
      : '');
    const _mirrorInputValue = _inputValue.value
    const topCtrlRef = ref(null);
    const inputRef = ref(null);
    const selectionRef = ref(null);
    const blurTimer = ref(null);
    const rootRef = ref(null);
    const selectionRefClick = () => {
      //e.stopPropagation();
      if (!props.disabled) {
        const input = getInputDOMNode();
        if (_focused.value && _open.value) {
          // this._focused = false;
          setOpenState(false, false);
          input && input.blur();
        } else {
          clearBlurTime();
          //this._focused = true;
          setOpenState(true, true);
          input && input.focus();
        }
      }
    };
    const getVLForOnChange = (vlsS) => {
      let vls = vlsS;
      if (vls !== undefined) {
        if (!props.labelInValue) {
          vls = vls.map(v => v);
        } else {
          vls = vls.map(vl => ({
            key: vl,
            label: getLabelBySingleValue(vl)
          }));
        }
        return isMultipleOrTags(props) ? vls : vls[0];
      }
      return vls;
    }
    const topCtrlContainerClick = (e) => {
      if (_open.value && !isSingleMode(props)) {
        e.stopPropagation();
      }
    }
    const clearBlurTime = () => {
      if (blurTimer.value) {
        clearTimeout(blurTimer.value);
        blurTimer.value = null;
      }
    };
    const getValueByInput = (str) => {
      const {multiple, tokenSeparators} = props;
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
    }
    const updateFocusClassName = () => {
      // avoid setState and its side effect
      if (_focused.value) {
        classes(rootRef.value).add(`${props.prefixCls}-focused`);
      } else {
        classes(rootRef.value).remove(`${props.prefixCls}-focused`);
      }
    };
    const inputClick = (e) => {
      if (_open.value) {
        clearBlurTime();
        e.stopPropagation();
      } else {
        _focused.value = false;
      }
    }
    const getInputDOMNode = () => {
      return topCtrlRef.value
        ? topCtrlRef.value.querySelector('input,textarea,div[contentEditable]')
        : inputRef.value;
    };
    const onInputChange = (e) => {
      const {value: val, composing} = e.target;
      if (e.isComposing || composing || _inputValue === val) {
        _mirrorInputValue.value = val;
        return;
      }
      const {tokenSeparators} = props;
      if (
        isMultipleOrTags(props) &&
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
      if (isCombobox(props)) {
        fireChange([val]);
      }
    }
    const fireChange = (value) => {
      if (!hasProp(this, 'value')) {
        _value.value = value;
        forcePopupAlign()
      }
      const vls = getVLForOnChange(value);
      const options = getOptionsBySingleValue(value);
      emit('change', vls, isMultipleOrTags(props) ? options : options[0]);
    }
    const fireSelect = (value) => {
      emit('select', getVLBySingleValue(value), getOptionBySingleValue(value));
    }
    const _getInputElement = () => {
      const attrs = getAttrs(this);
      const defaultInput = <input id={attrs.id} autocomplete="off"/>;

      const inputElement = props.getInputElement ? props.getInputElement() : defaultInput;
      const inputCls = classnames(getClass(inputElement), {
        [`${props.prefixCls}-search__field`]: true
      });
      const inputEvents: any = getEvents(inputElement);
      // https://github.com/ant-design/ant-design/issues/4992#issuecomment-281542159
      // Add space to the end of the inputValue as the width measurement tolerance
      inputElement.data = inputElement.data || {};
      return (
        <div class={`${props.prefixCls}-search__field__wrap`} onClick={inputClick}>
          {cloneElement(inputElement, {
            ...(inputElement.data.attrs || {}),
            disabled: props.disabled,
            value: _inputValue.value,
            domProps: {
              value: _inputValue.value
            },
            class: inputCls,
            ref: (el) => inputRef.value = el,
            onInput: onInputChange,
            onKeydown: chaining(
              onInputKeydown,
              inputEvents.keydown,
              getListeners(this).inputKeydown
            ),
            onFocus: chaining(inputFocus, inputEvents.focus),
            onBlur: chaining(inputBlur, inputEvents.blur)
          })}
          <span
            {...{
              directives: [
                {
                  name: 'ant-ref',
                  value: this.saveInputMirrorRef
                }
              ]
            }}
            // ref='inputMirrorRef'
            class={`${props.prefixCls}-search__field__mirror`}
          >
            {_mirrorInputValue}&nbsp;
          </span>
        </div>
      );
    }
    const getVLBySingleValue = (value) => {
      if (props.labelInValue) {
        return {
          key: value,
          label: getLabelBySingleValue(value)
        };
      }
      return value;
    }
    const renderTopControlNode = () => {
      const {
        choiceTransitionName,
        prefixCls,
        maxTagTextLength,
        maxTagCount,
        maxTagPlaceholder,
        showSearch
      } = props;
      const removeIcon = getComponentFromProp(getCurrentInstance(), 'removeIcon');
      const className = `${prefixCls}-selection__rendered`;
      // search input is inside topControlNode in single, multiple & combobox. 2016/04/13
      let innerNode = null;
      if (isSingleMode(props)) {
        let selectedValue = null;
        if (_value.length) {
          let showSelectedValue = false;
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
          const singleValue = _value[0];
          const {label, title} = this.getOptionInfoBySingleValue(singleValue);
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
              {this._getInputElement()}
            </div>
          ];
        }
      } else {
        let selectedValueNodes = [];
        let limitedCountValue = _value;
        let maxTagPlaceholderEl;
        if (maxTagCount !== undefined && _value.length > maxTagCount) {
          limitedCountValue = limitedCountValue.slice(0, maxTagCount);
          const omittedValues = this.getVLForOnChange(_value.slice(maxTagCount, _value.length));
          let content = `+ ${_value.length - maxTagCount} ...`;
          if (maxTagPlaceholder) {
            content =
              typeof maxTagPlaceholder === 'function'
                ? maxTagPlaceholder(omittedValues)
                : maxTagPlaceholder;
          }
          const attrs = {
            ...UNSELECTABLE_ATTRIBUTE,
            role: 'presentation',
            title: toTitle(content)
          };
          maxTagPlaceholderEl = (
            <li
              style={UNSELECTABLE_STYLE}
              {...{attrs}}
              onMousedown={preventDefaultEvent}
              class={`${prefixCls}-selection__choice ${prefixCls}-selection__choice__disabled`}
              key="maxTagPlaceholder"
            >
              <div class={`${prefixCls}-selection__choice__content`}>{content}</div>
            </li>
          );
        }
        if (isMultipleOrTags(props)) {
          selectedValueNodes = limitedCountValue.map(singleValue => {
            const info = this.getOptionInfoBySingleValue(singleValue);
            let content = info.label;
            const title = info.title || content;
            if (
              maxTagTextLength &&
              typeof content === 'string' &&
              content.length > maxTagTextLength
            ) {
              content = `${content.slice(0, maxTagTextLength)}...`;
            }
            const disabled = this.isChildDisabled(singleValue);
            const choiceClassName = disabled
              ? `${prefixCls}-selection__choice ${prefixCls}-selection__choice__disabled`
              : `${prefixCls}-selection__choice`;
            // attrs 放在一起，避免动态title混乱问题，很奇怪的问题 https://github.com/vueComponent/ant-design-vue/issues/588
            const attrs = {
              ...UNSELECTABLE_ATTRIBUTE,
              role: 'presentation',
              title: toTitle(title)
            };
            return (
              <li
                style={UNSELECTABLE_STYLE}
                {...{attrs}}
                onMousedown={preventDefaultEvent}
                class={choiceClassName}
                key={singleValue || SELECT_EMPTY_VALUE_KEY}
              >
                <div class={`${prefixCls}-selection__choice__content`}>{content}</div>
                {disabled ? null : (
                  <span
                    onClick={event => {
                      this.removeSelected(singleValue, event);
                    }}
                    class={`${prefixCls}-selection__choice__remove`}
                  >
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
            {this._getInputElement()}
          </li>
        );

        if (isMultipleOrTags(props) && choiceTransitionName) {
          const transitionProps = getTransitionProps(choiceTransitionName, {
            tag: 'ul',
            afterLeave: this.onChoiceAnimationLeave
          });
          innerNode = (
            <transition-group {...transitionProps}>{selectedValueNodes}</transition-group>
          );
        } else {
          innerNode = <ul>{selectedValueNodes}</ul>;
        }
      }
      return (
        <div
          class={className}
          ref={(el)=>topCtrlRef.value = el}
          onClick={topCtrlContainerClick}
        >
          {this.getPlaceholderElement()}
          {innerNode}
        </div>
      );
    }
    const getValueByLabel = (label) => {
      if (label === undefined) {
        return null;
      }
      let value = null;
      Object.keys(this.$data._optionsInfo).forEach(key => {
        const info = this.$data._optionsInfo[key];
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
    }
    const maybeFocus = (open: boolean, needFocus: boolean) => {
      if (needFocus || open) {
        const input = getInputDOMNode();
        const {activeElement} = document;
        if (input && (open || isMultipleOrTagsOrCombobox(this.$props))) {
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
    const getLabelBySingleValue = (value, optionsInfo?) => {
      const {label} = getOptionInfoBySingleValue(value, optionsInfo);
      return label;
    }
    const setOpenState = (open: boolean, config: any = {}) => {
      const {needFocus, fireSearch} = config;
      if (_open.value === open) {
        maybeFocus(open, !!needFocus);
        return;
      }
      emit('dropdownVisibleChange', open);
      // clear search input value when open is false in singleMode.
      if (!open && isSingleMode(props) && props.showSearch) {
        this.setInputValue('', fireSearch);
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
    return {
      setOpenState,
      updateFocusClassName,
      selectionRefClick,
      clearBlurTime,
      renderTopControlNode,
      saveRootRef: (el) => {
        rootRef.value = el;
      },
      setSelectTriggerRef: (el) => {
        selectTriggerRef.value = el
      }
    };
  },
  created() {
    this.saveInputRef = saveRef(this, 'inputRef');
    this.saveInputMirrorRef = saveRef(this, 'inputMirrorRef');
    this.saveTopCtrlRef = saveRef(this, 'topCtrlRef');
    this.saveSelectTriggerRef = saveRef(this, 'selectTriggerRef');
    this.saveSelectionRef = saveRef(this, 'selectionRef');
    this._focused = false;
    this._mouseDown = false;
    this._options = [];
    this._empty = false;
  },
  data() {
    const props = getOptionProps(this);

    return {
      _mirrorInputValue: state._inputValue, // https://github.com/vueComponent/ant-design-vue/issues/1458
      ...this.getDerivedStateFromProps(props, state)
    };
  },

  mounted() {
    this.$nextTick(() => {
      // when defaultOpen is true, we should auto focus search input
      // https://github.com/ant-design/ant-design/issues/14254
      if (this.autoFocus || this._open) {
        this.focus();
      }
      // this.setState({
      //   _ariaId: generateUUID(),
      // });
    });
  },
  watch: {
    __propsSymbol__() {
      Object.assign(this.$data, this.getDerivedStateFromProps(getOptionProps(this), this.$data));
    },
    '$data._inputValue'(val) {
      this.$data._mirrorInputValue = val;
    }
  },
  updated() {
    this.$nextTick(() => {
      if (isMultipleOrTags(this.$props)) {
        const inputNode = this.getInputDOMNode();
        const mirrorNode = this.getInputMirrorDOMNode();
        if (inputNode && inputNode.value && mirrorNode) {
          inputNode.style.width = '';
          inputNode.style.width = `${mirrorNode.clientWidth + 10}px`;
        } else if (inputNode) {
          inputNode.style.width = '';
        }
      }
      this.forcePopupAlign();
    });
  },
  beforeDestroy() {
    this.clearFocusTime();
    this.clearBlurTime();
    this.clearComboboxTime();
    if (this.dropdownContainer) {
      document.body.removeChild(this.dropdownContainer);
      this.dropdownContainer = null;
    }
  },
  methods: {
    getDerivedStateFromProps(nextProps, prevState) {
      const optionsInfo = prevState._skipBuildOptionsInfo
        ? prevState._optionsInfo
        : this.getOptionsInfoFromProps(nextProps, prevState);

      const newState = {
        _optionsInfo: optionsInfo,
        _skipBuildOptionsInfo: false
      };

      if ('open' in nextProps) {
        newState._open = nextProps.open;
      }

      if ('value' in nextProps) {
        const value = this.getValueFromProps(nextProps);
        newState._value = value;
        if (nextProps.combobox) {
          newState._inputValue = this.getInputValueForCombobox(nextProps, optionsInfo);
        }
      }
      return newState;
    },

    onDropdownVisibleChange(open) {
      if (open && !this._focused) {
        this.clearBlurTime();
        this.timeoutFocus();
        this._focused = true;
        this.updateFocusClassName();
      }
      this.setOpenState(open);
    },

    // combobox ignore
    onKeyDown(event) {
      const {_open: open} = this.$data;
      const {disabled} = this.$props;
      if (disabled) {
        return;
      }
      const keyCode = event.keyCode;
      if (open && !this.getInputDOMNode()) {
        this.onInputKeydown(event);
      } else if (keyCode === KeyCode.ENTER || keyCode === KeyCode.DOWN) {
        // vue state是同步更新，onKeyDown在onMenuSelect后会再次调用，单选时不在调用setOpenState
        // https://github.com/vueComponent/ant-design-vue/issues/1142
        if (keyCode === KeyCode.ENTER && !isMultipleOrTags(this.$props)) {
          this.maybeFocus(true);
        } else if (!open) {
          this.setOpenState(true);
        }
        event.preventDefault();
      } else if (keyCode === KeyCode.SPACE) {
        // Not block space if popup is shown
        if (!open) {
          this.setOpenState(true);
          event.preventDefault();
        }
      }
    },

    onMenuSelect({item}) {
      if (!item) {
        return;
      }
      let value = this.$data._value;
      const props = this.$props;
      const selectedValue = getValuePropValue(item);
      const lastValue = value[value.length - 1];
      let skipTrigger = false;

      if (isMultipleOrTags(props)) {
        if (findIndexInValueBySingleValue(value, selectedValue) !== -1) {
          skipTrigger = true;
        } else {
          value = value.concat([selectedValue]);
        }
      } else {
        if (
          !isCombobox(props) &&
          lastValue !== undefined &&
          lastValue === selectedValue &&
          selectedValue !== this.$data._backfillValue
        ) {
          this.setOpenState(false, {needFocus: true, fireSearch: false});
          skipTrigger = true;
        } else {
          value = [selectedValue];
          this.setOpenState(false, {needFocus: true, fireSearch: false});
        }
      }
      if (!skipTrigger) {
        this.fireChange(value);
      }
      if (!skipTrigger) {
        this.fireSelect(selectedValue);
        const inputValue = isCombobox(props) ? getPropValue(item, props.optionLabelProp) : '';

        if (props.autoClearSearchValue) {
          this.setInputValue(inputValue, false);
        }
      }
    },

    onMenuDeselect({item, domEvent}) {
      if (domEvent.type === 'keydown' && domEvent.keyCode === KeyCode.ENTER) {
        const menuItemDomNode = item.$el;
        // https://github.com/ant-design/ant-design/issues/20465#issuecomment-569033796
        if (!isHidden(menuItemDomNode)) {
          this.removeSelected(getValuePropValue(item));
        }
        return;
      }
      if (domEvent.type === 'click') {
        this.removeSelected(getValuePropValue(item));
      }
      if (this.autoClearSearchValue) {
        this.setInputValue('');
      }
    },

    onArrowClick(e) {
      e.stopPropagation();
      e.preventDefault();
      this.clearBlurTime();
      if (!this.disabled) {
        this.setOpenState(!this.$data._open, {needFocus: !this.$data._open});
      }
    },

    onPlaceholderClick() {
      if (this.getInputDOMNode() && this.getInputDOMNode()) {
        this.getInputDOMNode().focus();
      }
    },

    onPopupFocus() {
      // fix ie scrollbar, focus element again
      this.maybeFocus(true, true);
    },

    onClearSelection(event) {
      const props = this.$props;
      const state = this.$data;
      if (props.disabled) {
        return;
      }
      const {_inputValue: inputValue, _value: value} = state;
      event.stopPropagation();
      if (inputValue || value.length) {
        if (value.length) {
          this.fireChange([]);
        }
        this.setOpenState(false, {needFocus: true});
        if (inputValue) {
          this.setInputValue('');
        }
      }
    },

    onChoiceAnimationLeave() {
      this.forcePopupAlign();
    },
    getDropdownContainer() {
      if (!this.dropdownContainer) {
        this.dropdownContainer = document.createElement('div');
        document.body.appendChild(this.dropdownContainer);
      }
      return this.dropdownContainer;
    },

    getPlaceholderElement() {
      const {$props: props, $data: state} = this;
      let hidden = false;
      if (state._mirrorInputValue) {
        hidden = true;
      }
      const value = state._value;
      if (value.length) {
        hidden = true;
      }
      if (
        !state._mirrorInputValue &&
        isCombobox(props) &&
        value.length === 1 &&
        state._value &&
        !state._value[0]
      ) {
        hidden = false;
      }
      const placeholder = props.placeholder;
      if (placeholder) {
        const p = {
          onMousedown: preventDefaultEvent,
          onClick: this.onPlaceholderClick,
          ...UNSELECTABLE_ATTRIBUTE,
          style: {
            display: hidden ? 'none' : 'block',
            ...UNSELECTABLE_STYLE
          },
          class: `${props.prefixCls}-selection__placeholder`
        };
        return <div {...p}>{placeholder}</div>;
      }
      return null;
    },
    inputBlur(e) {
      const target = e.relatedTarget || document.activeElement;

      // https://github.com/vueComponent/ant-design-vue/issues/999
      // https://github.com/vueComponent/ant-design-vue/issues/1223
      if (
        (isIE || isEdge) &&
        (e.relatedTarget === this.$refs.arrow ||
          (target &&
            this.selectTriggerRef &&
            this.selectTriggerRef.getInnerMenu() &&
            this.selectTriggerRef.getInnerMenu().$el === target) ||
          contains(e.target, target))
      ) {
        e.target.focus();
        e.preventDefault();
        return;
      }
      this.clearBlurTime();
      if (this.disabled) {
        e.preventDefault();
        return;
      }
      this.blurTimer = setTimeout(() => {
        this._focused = false;
        this.updateFocusClassName();
        const props = this.$props;
        let {_value: value} = this.$data;
        const {_inputValue: inputValue} = this.$data;
        if (
          isSingleMode(props) &&
          props.showSearch &&
          inputValue &&
          props.defaultActiveFirstOption
        ) {
          const options = this._options || [];
          if (options.length) {
            const firstOption = findFirstMenuItem(options);
            if (firstOption) {
              value = [getValuePropValue(firstOption)];
              this.fireChange(value);
            }
          }
        } else if (isMultipleOrTags(props) && inputValue) {
          if (this._mouseDown) {
            // need update dropmenu when not blur
            this.setInputValue('');
          } else {
            // why not use setState?
            this.$data._inputValue = '';
            if (getInputDOMNode && this.getInputDOMNode()) {
              getInputDOMNode().value = '';
            }
          }
          const tmpValue = this.getValueByInput(inputValue);
          if (tmpValue !== undefined) {
            value = tmpValue;
            this.fireChange(value);
          }
        }
        // if click the rest space of Select in multiple mode
        if (isMultipleOrTags(props) && this._mouseDown) {
          this.maybeFocus(true, true);
          this._mouseDown = false;
          return;
        }
        this.setOpenState(false);
        this.$emit('blur', this.getVLForOnChange(value));
      }, 200);
    },


    getInputMirrorDOMNode() {
      return this.inputMirrorRef;
    },

    getPopupDOMNode() {
      if (this.selectTriggerRef) {
        return this.selectTriggerRef.getPopupDOMNode();
      }
    },

    getPopupMenuComponent() {
      if (this.selectTriggerRef) {
        return this.selectTriggerRef.getInnerMenu();
      }
    },
    focus() {
      if (isSingleMode(this.$props) && this.selectionRef) {
        this.selectionRef.focus();
      } else if (this.getInputDOMNode()) {
        this.getInputDOMNode().focus();
      }
    },

    blur() {
      if (isSingleMode(this.$props) && this.selectionRef) {
        this.selectionRef.blur();
      } else if (this.getInputDOMNode()) {
        this.getInputDOMNode().blur();
      }
    },
    markMouseDown() {
      this._mouseDown = true;
    },

    markMouseLeave() {
      this._mouseDown = false;
    },

    _filterOption(input, child, defaultFilter = defaultFilterFn) {
      const {_value: value, _backfillValue: backfillValue} = this.$data;
      const lastValue = value[value.length - 1];
      if (!input || (lastValue && lastValue === backfillValue)) {
        return true;
      }
      let filterFn = this.$props.filterOption;
      if (hasProp(this, 'filterOption')) {
        if (filterFn === true) {
          filterFn = defaultFilter.bind(this);
        }
      } else {
        filterFn = defaultFilter.bind(this);
      }
      if (!filterFn) {
        return true;
      } else if (typeof filterFn === 'function') {
        return filterFn.call(this, input, child);
      } else if (getValue(child, 'disabled')) {
        return false;
      }
      return true;
    },

    timeoutFocus() {
      if (this.focusTimer) {
        this.clearFocusTime();
      }
      this.focusTimer = window.setTimeout(() => {
        // this._focused = true
        // this.updateFocusClassName()
        this.$emit('focus');
      }, 10);
    },

    clearFocusTime() {
      if (this.focusTimer) {
        clearTimeout(this.focusTimer);
        this.focusTimer = null;
      }
    },

    clearComboboxTime() {
      if (this.comboboxTimer) {
        clearTimeout(this.comboboxTimer);
        this.comboboxTimer = null;
      }
    },

    renderFilterOptions() {
      const {_inputValue: inputValue} = this.$data;
      const {children, tags, notFoundContent} = this.$props;
      const menuItems = [];
      const childrenKeys = [];
      let empty = false;
      let options = this.renderFilterOptionsFromChildren(children, childrenKeys, menuItems);
      if (tags) {
        // tags value must be string
        let value = this.$data._value;
        value = value.filter(singleValue => {
          return (
            childrenKeys.indexOf(singleValue) === -1 &&
            (!inputValue || String(singleValue).indexOf(String(inputValue)) > -1)
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
            <MenuItem style={UNSELECTABLE_STYLE} {...{attrs}} value={key} key={key}>
              {key}
            </MenuItem>
          );
          options.push(menuItem);
          menuItems.push(menuItem);
        });
        // ref: https://github.com/ant-design/ant-design/issues/14090
        if (inputValue && menuItems.every(option => getValuePropValue(option) !== inputValue)) {
          const p = {
            attrs: UNSELECTABLE_ATTRIBUTE,
            key: inputValue,
            props: {
              value: inputValue,
              role: 'option'
            },
            style: UNSELECTABLE_STYLE
          };
          options.unshift(<MenuItem {...p}>{inputValue}</MenuItem>);
        }
      }

      if (!options.length && notFoundContent) {
        empty = true;
        const p = {
          attrs: UNSELECTABLE_ATTRIBUTE,
          key: 'NOT_FOUND',
          props: {
            value: 'NOT_FOUND',
            disabled: true,
            role: 'option'
          },
          style: UNSELECTABLE_STYLE
        };
        options = [<MenuItem {...p}>{notFoundContent}</MenuItem>];
      }
      return {empty, options};
    },

    renderFilterOptionsFromChildren(children = [], childrenKeys, menuItems) {
      const sel = [];
      const props = this.$props;
      const {_inputValue: inputValue} = this.$data;
      const tags = props.tags;
      children.forEach(child => {
        if (!child.data || child.data.slot !== undefined) {
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
          let childChildren = getSlots(child).default;
          childChildren = typeof childChildren === 'function' ? childChildren() : childChildren;
          // Match option group label
          if (inputValue && this._filterOption(inputValue, child)) {
            const innerItems = childChildren.map(subChild => {
              const childValueSub = getValuePropValue(subChild) || subChild.key;
              return (
                <MenuItem key={childValueSub} value={childValueSub} {...subChild.data}>
                  {subChild.componentOptions.children}
                </MenuItem>
              );
            });

            sel.push(
              <MenuItemGroup key={key} title={label} class={getClass(child)}>
                {innerItems}
              </MenuItemGroup>
            );

            // Not match
          } else {
            const innerItems = this.renderFilterOptionsFromChildren(
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

        validateOptionValue(childValue, this.$props);
        if (this._filterOption(inputValue, child)) {
          const p = {
            attrs: {
              ...UNSELECTABLE_ATTRIBUTE,
              ...getAttrs(child)
            },
            key: childValue,
            props: {
              value: childValue,
              ...getPropsData(child),
              role: 'option'
            },
            style: UNSELECTABLE_STYLE,
            on: getEvents(child),
            class: getClass(child)
          };
          const menuItem = <MenuItem {...p}>{child.componentOptions.children}</MenuItem>;
          sel.push(menuItem);
          menuItems.push(menuItem);
        }
        if (tags) {
          childrenKeys.push(childValue);
        }
      });

      return sel;
    },
    renderArrow(multiple) {
      // showArrow : Set to true if not multiple by default but keep set value.
      const {showArrow = !multiple, loading, prefixCls} = this.$props;
      const inputIcon = getComponentFromProp(getCurrentInstance(), 'inputIcon');
      if (!showArrow && !loading) {
        return null;
      }
      // if loading  have loading icon
      const defaultIcon = loading ? (
        <i class={`${prefixCls}-arrow-loading`}/>
      ) : (
        <i class={`${prefixCls}-arrow-icon`}/>
      );
      return (
        <span
          key="arrow"
          class={`${prefixCls}-arrow`}
          style={UNSELECTABLE_STYLE}
          {...{attrs: UNSELECTABLE_ATTRIBUTE}}
          onClick={this.onArrowClick}
          ref="arrow"
        >
          {inputIcon || defaultIcon}
        </span>
      );
    },
    renderClear() {
      const {prefixCls, allowClear} = this.$props;
      const {_value: value, _inputValue: inputValue} = this.$data;
      const clearIcon = getComponentFromProp(getCurrentInstance(), 'clearIcon');
      const clear = (
        <span
          key="clear"
          class={`${prefixCls}-selection__clear`}
          onMousedown={preventDefaultEvent}
          style={UNSELECTABLE_STYLE}
          {...{attrs: UNSELECTABLE_ATTRIBUTE}}
          onClick={this.onClearSelection}
        >
          {clearIcon || <i class={`${prefixCls}-selection__clear-icon`}>×</i>}
        </span>
      );
      if (!allowClear) {
        return null;
      }
      if (isCombobox(this.$props)) {
        if (inputValue) {
          return clear;
        }
        return null;
      }
      if (inputValue || value.length) {
        return clear;
      }
      return null;
    },
    selectionRefFocus(e) {
      if (this._focused || this.disabled || isMultipleOrTagsOrCombobox(this.$props)) {
        e.preventDefault();
        return;
      }
      this._focused = true;
      this.updateFocusClassName();
      this.$emit('focus');
    },
    selectionRefBlur(e) {
      if (isMultipleOrTagsOrCombobox(this.$props)) {
        e.preventDefault();
        return;
      }
      this.inputBlur(e);
    }
  },

  render(ctx) {
    const props = this.$props;
    const multiple = isMultipleOrTags(props);
    // Default set showArrow to true if not set (not set directly in defaultProps to handle multiple case)
    const {showArrow = true} = props;
    const state = this.$data;
    const {disabled, prefixCls, loading} = props;
    const ctrlNode = this.renderTopControlNode();
    const {_open: open, _inputValue: inputValue, _value: value} = this.$data;
    if (open) {
      const filterOptions = this.renderFilterOptions();
      this._empty = filterOptions.empty;
      this._options = filterOptions.options;
    }
    const realOpen = this.getRealOpenState();
    const empty = this._empty;
    const options = this._options || [];
    const {mouseenter = noop, mouseleave = noop, popupScroll = noop} = getListeners(this);
    const selectionProps = {
      role: 'combobox',
      'aria-autocomplete': 'list',
      'aria-haspopup': 'true',
      'aria-expanded': realOpen,
      'aria-controls': this.$data._ariaId,
      class: `${prefixCls}-selection ${prefixCls}-selection--${multiple ? 'multiple' : 'single'}`,
      key: 'selection'
    };
    //if (!isMultipleOrTagsOrCombobox(props)) {
    // selectionProps.on.keydown = this.onKeyDown;
    // selectionProps.on.focus = this.selectionRefFocus;
    // selectionProps.on.blur = this.selectionRefBlur;
    // selectionProps.attrs.tabIndex = props.disabled ? -1 : props.tabIndex;
    //}
    const rootCls = {
      [prefixCls]: true,
      [`${prefixCls}-open`]: open,
      [`${prefixCls}-focused`]: open || !!this._focused,
      [`${prefixCls}-combobox`]: isCombobox(props),
      [`${prefixCls}-disabled`]: disabled,
      [`${prefixCls}-enabled`]: !disabled,
      [`${prefixCls}-allow-clear`]: !!props.allowClear,
      [`${prefixCls}-no-arrow`]: !showArrow,
      [`${prefixCls}-loading`]: !!loading
    };
    return (
      <SelectTrigger
        dropdownAlign={props.dropdownAlign}
        dropdownClassName={props.dropdownClassName}
        dropdownMatchSelectWidth={props.dropdownMatchSelectWidth}
        defaultActiveFirstOption={props.defaultActiveFirstOption}
        dropdownMenuStyle={props.dropdownMenuStyle}
        transitionName={props.transitionName}
        animation={props.animation}
        prefixCls={props.prefixCls}
        dropdownStyle={props.dropdownStyle}
        combobox={props.combobox}
        showSearch={props.showSearch}
        options={options}
        empty={empty}
        multiple={multiple}
        disabled={disabled}
        visible={realOpen}
        inputValue={inputValue}
        value={value}
        backfillValue={state._backfillValue}
        firstActiveValue={props.firstActiveValue}
        onDropdownVisibleChange={this.onDropdownVisibleChange}
        getPopupContainer={props.getPopupContainer}
        onMenuSelect={this.onMenuSelect}
        onMenuDeselect={this.onMenuDeselect}
        onPopupScroll={popupScroll}
        onPopupFocus={this.onPopupFocus}
        onMouseenter={mouseenter}
        onMouseleave={mouseleave}
        showAction={props.showAction}
        menuItemSelectedIcon={getComponentFromProp(getCurrentInstance(), 'menuItemSelectedIcon')}
        ref={ctx.setSelectTriggerRef}
        dropdownRender={props.dropdownRender}
        ariaId={this.$data._ariaId}
      >
        <div
          ref={(el) => {
            this.saveRootRef(el);
            this.saveSelectionRef(el);
          }}
          style={getStyle(getCurrentInstance())}
          class={classnames(rootCls)}
          onMousedown={this.markMouseDown}
          onMouseup={this.markMouseLeave}
          onMouseout={this.markMouseLeave}
          tabIndex={props.disabled ? -1 : props.tabIndex}
          onBlur={this.selectionRefBlur}
          onFocus={this.selectionRefFocus}
          onClick={this.selectionRefClick}
          onKeydown={isMultipleOrTagsOrCombobox(props) ? noop : this.onKeyDown}
        >
          <div {...selectionProps}>
            {ctrlNode}
            {this.renderClear()}
            {this.renderArrow(!!multiple)}
          </div>
        </div>
      </SelectTrigger>
    );
  }
});
export {Select};
export default proxyComponent(Select);
