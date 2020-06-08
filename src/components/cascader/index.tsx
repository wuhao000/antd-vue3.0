import {useRefs} from '@/components/vc-tabs/src/save-ref';
import {useState} from '@/tools/state';
import arrayTreeFilter from 'array-tree-filter';
import classNames from 'classnames';
import omit from 'omit.js';
import {CSSProperties, defineComponent, inject, nextTick, onMounted, ref, watch} from 'vue';
import KeyCode from '../_util/keycode';
import {
  filterEmpty,
  getClassFromContext,
  getComponentFromContext,
  getListenersFromContext,
  getStyleFromContext,
  isValidElement
} from '../_util/props-util';
import {cloneElement} from '../_util/vnode';
import PropTypes from '../_util/vue-types';
import warning from '../_util/warning';
import Base from '../base';
import {useConfigProvider} from '../config-provider';
import Icon from '../icon';
import Input from '../input';
import VcCascader from '../vc-cascader';

const CascaderOptionType = PropTypes.shape({
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  label: PropTypes.any,
  disabled: PropTypes.bool,
  children: PropTypes.array,
  key: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
}).loose;

const FieldNamesType = PropTypes.shape({
  value: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  children: PropTypes.string
}).loose;

const CascaderExpandTrigger = PropTypes.oneOf(['click', 'hover']);

const ShowSearchType = PropTypes.shape({
  filter: PropTypes.func,
  render: PropTypes.func,
  sort: PropTypes.func,
  matchInputWidth: PropTypes.bool,
  limit: PropTypes.oneOfType([Boolean, Number])
}).loose;

function noop() {
}

const CascaderProps = {
  /** 可选项数据源 */
  options: PropTypes.arrayOf(CascaderOptionType).def([]),
  /** 默认的选中项 */
  defaultValue: PropTypes.array,
  /** 指定选中项 */
  value: PropTypes.array,
  /** 选择完成后的回调 */
  // onChange?: (value: string[], selectedOptions?: CascaderOptionType[]) => void;
  /** 选择后展示的渲染函数 */
  displayRender: PropTypes.func,
  transitionName: PropTypes.string.def('slide-up'),
  popupStyle: PropTypes.object.def(() => ({})),
  /** 自定义浮层类名 */
  popupClassName: PropTypes.string,
  /** 浮层预设位置：`bottomLeft` `bottomRight` `topLeft` `topRight` */
  popupPlacement: PropTypes.oneOf(['bottomLeft', 'bottomRight', 'topLeft', 'topRight']).def(
      'bottomLeft'
  ),
  /** 输入框占位文本*/
  placeholder: PropTypes.string.def('Please select'),
  /** 输入框大小，可选 `large` `default` `small` */
  size: PropTypes.oneOf(['large', 'default', 'small']),
  /** 禁用*/
  disabled: PropTypes.bool.def(false),
  /** 是否支持清除*/
  allowClear: PropTypes.bool.def(true),
  showSearch: PropTypes.oneOfType([Boolean, ShowSearchType]),
  notFoundContent: PropTypes.any,
  loadData: PropTypes.func,
  /** 次级菜单的展开方式，可选 'click' 和 'hover' */
  expandTrigger: CascaderExpandTrigger,
  /** 当此项为 true 时，点选每级菜单选项值都会发生变化 */
  changeOnSelect: PropTypes.bool,
  /** 浮层可见变化时回调 */
  // onPopupVisibleChange?: (popupVisible: boolean) => void;
  prefixCls: PropTypes.string,
  inputPrefixCls: PropTypes.string,
  getPopupContainer: PropTypes.func,
  popupVisible: PropTypes.bool,
  fieldNames: FieldNamesType,
  autoFocus: PropTypes.bool,
  suffixIcon: PropTypes.any
};

// We limit the filtered item count by default
const defaultLimit = 50;

function defaultFilterOption(inputValue, path, names) {
  return path.some(option => option[names.label].indexOf(inputValue) > -1);
}

function defaultSortFilteredOption(a, b, inputValue, names) {
  function callback(elem) {
    return elem[names.label].indexOf(inputValue) > -1;
  }

  return a.findIndex(callback) - b.findIndex(callback);
}

function getFilledFieldNames({fieldNames = {} as any}) {
  return {
    children: fieldNames.children || 'children',
    label: fieldNames.label || 'label',
    value: fieldNames.value || 'value'
  };
}

function flattenTree(options = [], props, ancestor = []) {
  const names = getFilledFieldNames(props);
  let flattenOptions = [];
  const childrenName = names.children;
  options.forEach(option => {
    const path = ancestor.concat(option);
    if (props.changeOnSelect || !option[childrenName] || !option[childrenName].length) {
      flattenOptions.push(path);
    }
    if (option[childrenName]) {
      flattenOptions = flattenOptions.concat(flattenTree(option[childrenName], props, path));
    }
  });
  return flattenOptions;
}

const defaultDisplayRender = ({labels}) => {
  return labels.join(' / ');
};

const Cascader = defineComponent({
  inheritAttrs: false,
  name: 'ACascader',
  props: CascaderProps,
  setup($props, {emit, slots}) {
    const cachedOptions = ref([]);
    const {state: $state, setState} = useState(() => {
      const {value, defaultValue, popupVisible, showSearch, options} = $props;
      return {
        sValue: value || defaultValue || [],
        inputValue: '',
        inputFocused: false,
        sPopupVisible: popupVisible,
        flattenOptions: showSearch ? flattenTree(options, $props) : undefined
      };
    });
    watch(() => $props.value, (val) => {
      setState({sValue: val || []});
    });
    watch(() => $props.popupVisible, (val) => {
      setState({sPopupVisible: val});
    });
    watch(() => $props.options, (val) => {
      if ($props.showSearch) {
        setState({flattenOptions: flattenTree(val, $props)});
      }
    });
    const highlightKeyword = (str, keyword, prefixCls) => {
      return str
          .split(keyword)
          .map((node, index) =>
              index === 0
                  ? node
                  : [<span class={`${prefixCls}-menu-item-keyword`}>{keyword}</span>, node]
          );
    };
    const defaultRenderFilteredOption = ({inputValue, path, prefixCls, names}) => {
      return path.map((option, index) => {
        const label = option[names.label];
        const node =
            label.indexOf(inputValue) > -1
                ? highlightKeyword(label, inputValue, prefixCls)
                : label;
        return index === 0 ? node : [' / ', node];
      });
    };
    const handleChange = (value, selectedOptions) => {
      setState({inputValue: ''});
      if (selectedOptions[0].__IS_FILTERED_OPTION) {
        const unwrappedValue = value[0];
        const unwrappedSelectedOptions = selectedOptions[0].path;
        setValue(unwrappedValue, unwrappedSelectedOptions);
        return;
      }
      setValue(value, selectedOptions);
    };
    const handlePopupVisibleChange = (popupVisible) => {
      if (popupVisible === undefined) {
        setState(state => ({
          sPopupVisible: popupVisible,
          inputFocused: popupVisible,
          inputValue: popupVisible ? state.inputValue : ''
        }));
      }
      emit('popupVisibleChange', popupVisible);
    };
    const handleInputFocus = (e) => {
      emit('focus', e);
    };
    const handleInputBlur = (e) => {
      setState({
        inputFocused: false
      });
      emit('blur', e);
    };
    const handleInputClick = (e) => {
      const {inputFocused, sPopupVisible} = $state;
      // Prevent `Trigger` behaviour.
      if (inputFocused || sPopupVisible) {
        e.stopPropagation();
        if (e.nativeEvent && e.nativeEvent.stopImmediatePropagation) {
          e.nativeEvent.stopImmediatePropagation();
        }
      }
    };
    const handleKeyDown = (e) => {
      if (e.keyCode === KeyCode.BACKSPACE || e.keyCode === KeyCode.SPACE) {
        e.stopPropagation();
      }
    };
    const handleInputChange = (e) => {
      const inputValue = e.target.value;
      setState({inputValue});
      emit('search', inputValue);
    };
    const setValue = (value, selectedOptions?) => {
      if (value !== undefined) {
        setState({sValue: value});
      }
      emit('change', value, selectedOptions);
    };
    const getLabel = () => {
      const {options} = $props;
      const names = getFilledFieldNames($props);
      const displayRender = getComponentFromContext({$props, $slots: slots}, 'displayRender') || defaultDisplayRender;
      const value = $state.sValue;
      const unwrappedValue = Array.isArray(value[0]) ? value[0] : value;
      const selectedOptions = arrayTreeFilter(
          options,
          (o, level) => o[names.value] === unwrappedValue[level],
          {childrenKeyName: names.children}
      );
      const labels = selectedOptions.map(o => o[names.label]);
      return displayRender({labels, selectedOptions});
    };
    const clearSelection = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if ($state.inputValue) {
        setState({inputValue: ''});
      } else {
        setValue([]);
        handlePopupVisibleChange(false);
      }
    };
    const generateFilteredOptions = (prefixCls, renderEmpty) => {
      const {showSearch, notFoundContent} = $props;
      const names = getFilledFieldNames($props);
      const {
        filter = defaultFilterOption,
        // render = this.defaultRenderFilteredOption,
        sort = defaultSortFilteredOption,
        limit = defaultLimit
      } = showSearch;
      const render = showSearch.render || slots.showSearchRender || defaultRenderFilteredOption;
      const {flattenOptions = [], inputValue} = $state;

      // Limit the filter if needed
      let filtered;
      if (limit > 0) {
        filtered = [];
        let matchCount = 0;

        // Perf optimization to filter items only below the limit
        flattenOptions.some(path => {
          const match = filter(inputValue, path, names);
          if (match) {
            filtered.push(path);
            matchCount += 1;
          }
          return matchCount >= limit;
        });
      } else {
        warning(
            typeof limit !== 'number',
            'Cascader',
            '\'limit\' of showSearch in Cascader should be positive number or false.'
        );
        filtered = flattenOptions.filter(path => filter(inputValue, path, names));
      }

      filtered.sort((a, b) => sort(a, b, inputValue, names));

      if (filtered.length > 0) {
        return filtered.map(path => {
          return {
            __IS_FILTERED_OPTION: true,
            path,
            [names.label]: render({inputValue, path, prefixCls, names}),
            [names.value]: path.map(o => o[names.value]),
            disabled: path.some(o => !!o.disabled)
          };
        });
      }
      return [
        {
          [names.label]: notFoundContent || renderEmpty('Cascader'),
          [names.value]: 'ANT_CASCADER_NOT_FOUND',
          disabled: true
        }
      ];
    };
    const {getRef, saveRef} = useRefs();
    const focus = () => {
      if ($props.showSearch) {
        getRef('input').focus();
      } else {
        getRef('picker').focus();
      }
    };
    const blur = () => {
      if ($props.showSearch) {
        getRef('input').blur();
      } else {
        getRef('picker').blur();
      }
    };
    onMounted(() => {
      nextTick(() => {
        if ($props.autoFocus && !$props.showSearch && !$props.disabled) {
          getRef('picker').focus();
        }
      });
    });
    const localeData = inject('localeData', {} as any);
    return {
      localeData,
      highlightKeyword,
      defaultRenderFilteredOption,
      handleChange,
      setState,
      handlePopupVisibleChange,
      handleInputFocus,
      handleInputBlur,
      handleInputClick,
      handleKeyDown,
      handleInputChange,
      setValue,
      getLabel,
      clearSelection,
      generateFilteredOptions,
      focus,
      blur,
      $state,
      saveRef,
      getRef,
      setCachedOptions(value) {
        cachedOptions.value = value;
      },
      configProvider: useConfigProvider()
    };
  },
  render() {
    const {sPopupVisible, inputValue} = this.$state;
    const {$slots, configProvider, localeData} = this;
    const {sValue: value, inputFocused} = this.$state;
    const props = this.$props;
    let suffixIcon = getComponentFromContext(this, 'suffixIcon');
    suffixIcon = Array.isArray(suffixIcon) ? suffixIcon[0] : suffixIcon;
    const {getPopupContainer: getContextPopupContainer} = configProvider;
    const {
      prefixCls: customizePrefixCls,
      inputPrefixCls: customizeInputPrefixCls,
      placeholder = localeData.placeholder,
      size,
      disabled,
      allowClear,
      showSearch = false,
      notFoundContent,
      ...otherProps
    } = props;
    const getPrefixCls = useConfigProvider().getPrefixCls;
    const renderEmpty = useConfigProvider().renderEmpty;
    const prefixCls = getPrefixCls('cascader', customizePrefixCls);
    const inputPrefixCls = getPrefixCls('input', customizeInputPrefixCls);

    const sizeCls = classNames({
      [`${inputPrefixCls}-lg`]: size === 'large',
      [`${inputPrefixCls}-sm`]: size === 'small'
    });
    const clearIcon =
        (allowClear && !disabled && value.length > 0) || inputValue ? (
            <Icon
                type="close-circle"
                theme="filled"
                class={`${prefixCls}-picker-clear`}
                onClick={this.clearSelection}
                key="clear-icon"
            />
        ) : null;
    const arrowCls = classNames({
      [`${prefixCls}-picker-arrow`]: true,
      [`${prefixCls}-picker-arrow-expand`]: sPopupVisible
    });
    const pickerCls = classNames(getClassFromContext(this), `${prefixCls}-picker`, {
      [`${prefixCls}-picker-with-value`]: inputValue,
      [`${prefixCls}-picker-disabled`]: disabled,
      [`${prefixCls}-picker-${size}`]: !!size,
      [`${prefixCls}-picker-show-search`]: !!showSearch,
      [`${prefixCls}-picker-focused`]: inputFocused
    });

    // Fix bug of https://github.com/facebook/react/pull/5004
    // and https://fb.me/react-unknown-prop
    const tempInputProps = omit(otherProps, [
      'options',
      'popupPlacement',
      'transitionName',
      'displayRender',
      'changeOnSelect',
      'expandTrigger',
      'popupVisible',
      'getPopupContainer',
      'loadData',
      'popupClassName',
      'defaultValue',
      'fieldNames'
    ]);

    let options = props.options;
    const names = getFilledFieldNames(this.$props);
    if (options && options.length > 0) {
      if (inputValue) {
        options = this.generateFilteredOptions(prefixCls, renderEmpty);
      }
    } else {
      options = [
        {
          [names.label]: notFoundContent || renderEmpty('Cascader'),
          [names.value]: 'ANT_CASCADER_NOT_FOUND',
          disabled: true
        }
      ];
    }

    // Dropdown menu should keep previous status until it is fully closed.
    if (sPopupVisible) {
      this.setCachedOptions(options);
    } else {
      // todo
      // options = this.cachedOptions;
    }

    const dropdownMenuColumnStyle: CSSProperties = {};
    const isNotFound =
        (options || []).length === 1 && options[0].value === 'ANT_CASCADER_NOT_FOUND';
    if (isNotFound) {
      dropdownMenuColumnStyle.height = 'auto'; // Height of one row.
    }
    // The default value of `matchInputWidth` is `true`
    const resultListMatchInputWidth = showSearch.matchInputWidth !== false;
    if (resultListMatchInputWidth && (inputValue || isNotFound) && this.$refs.input) {
      dropdownMenuColumnStyle.width = this.getRef('input').vnode.el.offsetWidth + 'px';
    }
    // showSearch时，focus、blur在input上触发，反之在ref='picker'上触发
    const inputProps = {
      ...tempInputProps,
      prefixCls: inputPrefixCls,
      placeholder: value && value.length > 0 ? undefined : placeholder,
      value: inputValue,
      disabled,
      readOnly: !showSearch,
      autoComplete: 'off',
      class: `${prefixCls}-input ${sizeCls}`,
      ref: this.saveRef('input'),
      onFocus: showSearch ? this.handleInputFocus : noop,
      onClick: showSearch ? this.handleInputClick : noop,
      onBlur: showSearch ? this.handleInputBlur : noop,
      onKeydown: this.handleKeyDown,
      onChange: showSearch ? this.handleInputChange : noop,
      ...this.$attrs
    };
    const children = filterEmpty($slots.default);
    const inputIcon = (suffixIcon &&
        (isValidElement(suffixIcon) ? (
            cloneElement(suffixIcon, {
              class: {
                [`${prefixCls}-picker-arrow`]: true
              }
            })
        ) : (
            <span class={`${prefixCls}-picker-arrow`}>{suffixIcon}</span>
        ))) || <Icon type="down" class={arrowCls}/>;

    const input = children.length ? (
        children
    ) : (
        <span class={pickerCls} style={getStyleFromContext(this)} ref={this.saveRef('picker')}>
          {showSearch ? <span class={`${prefixCls}-picker-label`}>{this.getLabel()}</span> : null}
          <Input {...inputProps} />
          {!showSearch ? <span class={`${prefixCls}-picker-label`}>{this.getLabel()}</span> : null}
          {clearIcon}
          {inputIcon}
        </span>
    );

    const expandIcon = <Icon type="right"/>;

    const loadingIcon = (
        <span class={`${prefixCls}-menu-item-loading-icon`}>
          <Icon type="redo" spin={true}/>
        </span>
    );
    const getPopupContainer = props.getPopupContainer || getContextPopupContainer;
    const cascaderProps = {
      ...props,
      getPopupContainer,
      options,
      prefixCls,
      value,
      popupVisible: sPopupVisible,
      dropdownMenuColumnStyle,
      expandIcon,
      loadingIcon,
      ...getListenersFromContext(this),
      onPopupVisibleChange: this.handlePopupVisibleChange,
      onChange: this.handleChange
    };
    return <VcCascader {...cascaderProps}>{input}</VcCascader>;
  }
});

/* istanbul ignore next */
Cascader.install = function(Vue) {
  Vue.use(Base);
  Vue.component(Cascader.name, Cascader);
};

export default Cascader;
