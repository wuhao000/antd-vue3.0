import {useRefs} from '@/components/vc-tabs/src/save-ref';
import {useState} from '@/tools/state';
import arrayTreeFilter from 'array-tree-filter';
import shallowEqualArrays from 'shallow-equal/arrays';
import {defineComponent, ref, watch} from 'vue';
import KeyCode, {KeyName} from '../_util/keycode';
import {getComponentFromContext, getListenersFromContext, getListenersFromVNode} from '../_util/props-util';
import {cloneElement} from '../_util/vnode';
import PropTypes from '../_util/vue-types';
import Trigger from '../vc-trigger';
import Menus from './menus';

const BUILT_IN_PLACEMENTS = {
  bottomLeft: {
    points: ['tl', 'bl'],
    offset: [0, 4],
    overflow: {
      adjustX: 1,
      adjustY: 1
    }
  },
  topLeft: {
    points: ['bl', 'tl'],
    offset: [0, -4],
    overflow: {
      adjustX: 1,
      adjustY: 1
    }
  },
  bottomRight: {
    points: ['tr', 'br'],
    offset: [0, 4],
    overflow: {
      adjustX: 1,
      adjustY: 1
    }
  },
  topRight: {
    points: ['br', 'tr'],
    offset: [0, -4],
    overflow: {
      adjustX: 1,
      adjustY: 1
    }
  }
};

export default defineComponent({
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    value: PropTypes.array,
    defaultValue: PropTypes.array,
    options: PropTypes.array,
    // onChange: PropTypes.func,
    // onPopupVisibleChange: PropTypes.func,
    popupVisible: PropTypes.bool,
    disabled: PropTypes.bool.def(false),
    transitionName: PropTypes.string.def(''),
    popupClassName: PropTypes.string.def(''),
    popupStyle: PropTypes.object.def(() => ({})),
    popupPlacement: PropTypes.string.def('bottomLeft'),
    prefixCls: PropTypes.string.def('rc-cascader'),
    dropdownMenuColumnStyle: PropTypes.object,
    builtinPlacements: PropTypes.object.def(BUILT_IN_PLACEMENTS),
    loadData: PropTypes.func,
    changeOnSelect: PropTypes.bool,
    // onKeyDown: PropTypes.func,
    expandTrigger: PropTypes.string.def('click'),
    fieldNames: PropTypes.object.def(() => ({
      label: 'label',
      value: 'value',
      children: 'children'
    })),
    expandIcon: PropTypes.any,
    loadingIcon: PropTypes.any,
    getPopupContainer: PropTypes.func
  },
  setup($props, {emit, slots}) {
    const {createState, setState} = useState<any>();
    const getInitState = () => {
      let initialValue = [];
      const {value, defaultValue, popupVisible} = $props;
      if ($props.value !== undefined) {
        initialValue = value || [];
      } else if ($props.defaultValue !== undefined) {
        initialValue = defaultValue || [];
      }
      // warning(!('filedNames' in props),
      //   '`filedNames` of Cascader is a typo usage and deprecated, please use `fieldNames` instead.');

      return {
        sPopupVisible: popupVisible,
        sActiveValue: initialValue,
        sValue: initialValue
      };
    };
    const $data = createState(getInitState());
    watch(() => $props.value, (val, oldValue) => {
      if (!shallowEqualArrays(val, oldValue)) {
        const newValues: any = {
          sValue: val || []
        };
        // allow activeValue diff from value
        // https://github.com/ant-design/ant-design/issues/2767
        if ($props.loadData === undefined) {
          newValues.sActiveValue = val || [];
        }
        setState(newValues);
      }
    });
    watch(() => $props.popupVisible, (val) => {
      setState({
        sPopupVisible: val
      });
    });
    const {getRef, saveRef} = useRefs();
    const getPopupDOMNode = () => {
      return getRef('trigger').getPopupDomNode();
    };
    const defaultFieldNames = ref(undefined);
    const getFieldName = (name) => {
      const {fieldNames} = $props;
      return fieldNames[name] || defaultFieldNames.value[name];
    };
    const getFieldNames = () => {
      return $props.fieldNames;
    };
    const getCurrentLevelOptions = () => {
      const {options = []} = $props;
      const {sActiveValue = []} = $data;
      const result = arrayTreeFilter(
          options,
          (o, level) => o[getFieldName('value')] === sActiveValue[level],
          {childrenKeyName: getFieldName('children')}
      );
      if (result[result.length - 2]) {
        return result[result.length - 2][getFieldName('children')];
      }
      return [...options].filter(o => !o.disabled);
    };
    const getActiveOptions = (activeValue) => {
      return arrayTreeFilter(
          $props.options || [],
          (o, level) => o[getFieldName('value')] === activeValue[level],
          {childrenKeyName: getFieldName('children')}
      );
    };
    const setPopupVisible = (popupVisible) => {
      if ($props.popupVisible === undefined) {
        setState({sPopupVisible: popupVisible});
      }
      // sync activeValue with value when panel open
      if (popupVisible && !$data.sPopupVisible) {
        setState({
          sActiveValue: $data.sValue
        });
      }
      emit('popupVisibleChange', popupVisible);
    };
    const handleChange = (options, setProps, e) => {
      if (e.type !== 'keydown' || e.keyCode === KeyCode.ENTER) {
        emit(
            'change',
            options.map(o => o[getFieldName('value')]),
            options
        );
        setPopupVisible(setProps.visible);
      }
    };
    const handlePopupVisibleChange = (popupVisible) => {
      setPopupVisible(popupVisible);
    };
    const handleMenuSelect = (targetOption, menuIndex, e) => {
      // Keep focused state for keyboard support
      const triggerNode = getRef('trigger').getRootDomNode();
      if (triggerNode && triggerNode.focus) {
        triggerNode.focus();
      }
      const {changeOnSelect, loadData, expandTrigger} = $props;
      if (!targetOption || targetOption.disabled) {
        return;
      }
      let {sActiveValue} = $data;
      sActiveValue = sActiveValue.slice(0, menuIndex + 1);
      sActiveValue[menuIndex] = targetOption[getFieldName('value')];
      const activeOptions = getActiveOptions(sActiveValue);
      if (
          targetOption.isLeaf === false &&
          !targetOption[getFieldName('children')] &&
          loadData
      ) {
        if (changeOnSelect) {
          handleChange(activeOptions, {visible: true}, e);
        }
        setState({sActiveValue});
        loadData(activeOptions);
        return;
      }
      const newState: any = {};
      if (
          !targetOption[getFieldName('children')] ||
          !targetOption[getFieldName('children')].length
      ) {
        handleChange(activeOptions, {visible: false}, e);
        // set value to activeValue when select leaf option
        newState.sValue = sActiveValue;
        // add e.type judgement to prevent `onChange` being triggered by mouseEnter
      } else if (changeOnSelect && (e.type === 'click' || e.type === 'keydown')) {
        if (expandTrigger === 'hover') {
          handleChange(activeOptions, {visible: false}, e);
        } else {
          handleChange(activeOptions, {visible: true}, e);
        }
        // set value to activeValue on every select
        newState.sValue = sActiveValue;
      }
      newState.sActiveValue = sActiveValue;
      //  not change the value by keyboard
      if ($props.value !== undefined || (e.type === 'keydown' && e.keyCode !== KeyCode.ENTER)) {
        delete newState.sValue;
      }
      setState(newState);
    };
    const handleItemDoubleClick = () => {
      const {changeOnSelect} = $props;
      if (changeOnSelect) {
        setPopupVisible(false);
      }
    };
    const handleKeyDown = (e) => {
      const children = slots.default && slots.default()[0];
      // https://github.com/ant-design/ant-design/issues/6717
      // Don't bind keyboard support when children specify the onKeyDown
      if (children) {
        const keydown = getListenersFromVNode(children).keydown;
        if (keydown) {
          keydown(e);
          return;
        }
      }
      const activeValue = [...$data.sActiveValue];
      const currentLevel = activeValue.length - 1 < 0 ? 0 : activeValue.length - 1;
      const currentOptions = getCurrentLevelOptions();
      const currentIndex = currentOptions
          .map(o => o[getFieldName('value')])
          .indexOf(activeValue[currentLevel]);
      if (
          e.keyCode !== KeyCode.DOWN &&
          e.keyCode !== KeyCode.UP &&
          e.keyCode !== KeyCode.LEFT &&
          e.keyCode !== KeyCode.RIGHT &&
          e.keyCode !== KeyCode.ENTER &&
          e.keyCode !== KeyCode.SPACE &&
          e.keyCode !== KeyCode.BACKSPACE &&
          e.keyCode !== KeyCode.ESC &&
          e.keyCode !== KeyCode.TAB
      ) {
        return;
      }
      // Press any keys above to reopen menu
      if (
          !$data.sPopupVisible &&
          e.keyCode !== KeyCode.BACKSPACE &&
          e.keyCode !== KeyCode.LEFT &&
          e.keyCode !== KeyCode.RIGHT &&
          e.keyCode !== KeyCode.ESC &&
          e.keyCode !== KeyCode.TAB
      ) {
        setPopupVisible(true);
        return;
      }
      if (e.key === KeyName.Down || e.key === KeyName.Up) {
        e.preventDefault();
        let nextIndex = currentIndex;
        if (nextIndex === -1) {
          nextIndex = 0;
        } else {
          if (e.key === KeyName.Down) {
            nextIndex += 1;
            nextIndex = nextIndex >= currentOptions.length ? 0 : nextIndex;
          } else {
            nextIndex -= 1;
            nextIndex = nextIndex < 0 ? currentOptions.length - 1 : nextIndex;
          }
        }
        activeValue[currentLevel] = currentOptions[nextIndex][getFieldName('value')];
      } else if (e.key === KeyName.Left || e.keyCode === KeyCode.BACKSPACE) {
        e.preventDefault();
        activeValue.splice(activeValue.length - 1, 1);
      } else if (e.key === KeyName.Right) {
        e.preventDefault();
        if (
            currentOptions[currentIndex] &&
            currentOptions[currentIndex][getFieldName('children')]
        ) {
          activeValue.push(
              currentOptions[currentIndex][getFieldName('children')][0][
                  getFieldName('value')
                  ]
          );
        }
      } else if (e.keyCode === KeyCode.ESC || e.keyCode === KeyCode.TAB) {
        setPopupVisible(false);
        return;
      }
      if (!activeValue || activeValue.length === 0) {
        setPopupVisible(false);
      }
      const activeOptions = getActiveOptions(activeValue);
      const targetOption = activeOptions[activeOptions.length - 1];
      handleMenuSelect(targetOption, activeOptions.length - 1, e);
      emit('keydown', e);
    };


    return {
      getPopupDOMNode,
      getFieldName,
      defaultFieldNames,
      getFieldNames,
      getCurrentLevelOptions,
      getActiveOptions,
      setState,
      setPopupVisible,
      saveRef,
      handleChange,
      handlePopupVisibleChange,
      handleMenuSelect,
      handleItemDoubleClick,
      handleKeyDown,
      $data
    };
  },
  render() {
    const {
      $props,
      handleMenuSelect,
      handlePopupVisibleChange,
      handleKeyDown
    } = this;
    const {
      sActiveValue,
      sPopupVisible
    } = this.$data;
    const listeners = getListenersFromContext(this);
    const {
      prefixCls,
      transitionName,
      popupClassName,
      options = [],
      disabled,
      builtinPlacements,
      popupPlacement,
      ...restProps
    } = $props;
    // Did not show popup when there is no options
    let menus = <div/>;
    let emptyMenuClassName = '';
    if (options && options.length > 0) {
      const loadingIcon = getComponentFromContext(this, 'loadingIcon');
      const expandIcon = getComponentFromContext(this, 'expandIcon') || '>';
      const menusProps = {
        ...$props,
        fieldNames: this.getFieldNames(),
        defaultFieldNames: this.defaultFieldNames,
        activeValue: sActiveValue,
        visible: sPopupVisible,
        loadingIcon,
        expandIcon,
        ...listeners,
        onSelect: handleMenuSelect,
        onItemDoubleClick: this.handleItemDoubleClick
      };
      menus = <Menus {...menusProps} />;
    } else {
      emptyMenuClassName = ` ${prefixCls}-menus-empty`;
    }
    const triggerProps = {
      ...restProps,
      disabled,
      popupPlacement,
      builtinPlacements,
      popupTransitionName: transitionName,
      action: disabled ? [] : ['click'],
      popupVisible: disabled ? false : sPopupVisible,
      prefixCls: `${prefixCls}-menus`,
      popupClassName: popupClassName + emptyMenuClassName,
      ...listeners,
      onPopupVisibleChange: handlePopupVisibleChange,
      ref: this.saveRef('trigger')
    };
    const children = this.$slots.default && this.$slots.default()[0];
    return (
        <Trigger {...triggerProps}>
          {children &&
          cloneElement(children, {
            onKeydown: handleKeyDown,
            tabIndex: disabled ? undefined : 0
          })}
          <template slot="popup">{menus}</template>
        </Trigger>
    );
  }
});
