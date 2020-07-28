import {useRefs} from '@/components/vc-tabs/src/save-ref';
import arrayTreeFilter from 'array-tree-filter';
import {defineComponent, nextTick, onMounted, ref, watch} from 'vue';
import {getComponentFromContext} from '../_util/props-util';
import PropTypes from '../_util/vue-types';

export default defineComponent({
  name: 'CascaderMenus',
  props: {
    value: PropTypes.array.def([]),
    activeValue: PropTypes.array.def([]),
    options: PropTypes.array,
    prefixCls: PropTypes.string.def('rc-cascader-menus'),
    expandTrigger: PropTypes.string.def('click'),
    // onSelect: PropTypes.func,
    visible: PropTypes.bool.def(false),
    dropdownMenuColumnStyle: PropTypes.object,
    defaultFieldNames: PropTypes.object,
    fieldNames: PropTypes.object,
    expandIcon: PropTypes.any,
    loadingIcon: PropTypes.any
  },
  setup($props, {emit, slots}) {
    watch(() => $props.visible, (val) => {
      if (val) {
        nextTick(() => {
          scrollActiveItemToView();
        });
      }
    });
    const getFieldName = (name) => {
      const {fieldNames, defaultFieldNames} = $props;
      // 防止只设置单个属性的名字
      return fieldNames[name] || defaultFieldNames[name];
    };
    const getOption = (option, menuIndex) => {
      const {prefixCls, expandTrigger} = $props;
      const loadingIcon = getComponentFromContext({$props, $slots: slots}, 'loadingIcon');
      const expandIcon = getComponentFromContext({$props, $slots: slots}, 'expandIcon');
      const onSelect = e => {
        emit('select', option, menuIndex, e);
      };
      const onItemDoubleClick = e => {
        emit('itemDoubleClick', option, menuIndex, e);
      };
      const key = option[getFieldName('value')];
      const expandProps: any = {
        role: 'menuitem',
        onClick: onSelect,
        onDblclick: onItemDoubleClick,
        onMousedown: e => e.preventDefault(),
        key: Array.isArray(key) ? key.join('__ant__') : key
      };
      let menuItemCls = `${prefixCls}-menu-item`;
      let expandIconNode = null;
      const hasChildren =
          option[getFieldName('children')] && option[getFieldName('children')].length > 0;
      if (hasChildren || option.isLeaf === false) {
        menuItemCls += ` ${prefixCls}-menu-item-expand`;
        if (!option.loading) {
          expandIconNode = <span class={`${prefixCls}-menu-item-expand-icon`}>{expandIcon}</span>;
        }
      }
      if (expandTrigger === 'hover' && (hasChildren || option.isLeaf === false)) {
        Object.assign(expandProps, {
          onMouseenter: delayOnSelect.bind(this, onSelect),
          onMouseleave: delayOnSelect.bind(this),
          onClick: onSelect
        });
      }
      if (isActiveOption(option, menuIndex)) {
        menuItemCls += ` ${prefixCls}-menu-item-active`;
        expandProps.ref = saveRef(getMenuItemRef(menuIndex));
      }
      if (option.disabled) {
        menuItemCls += ` ${prefixCls}-menu-item-disabled`;
      }
      let loadingIconNode = null;
      if (option.loading) {
        menuItemCls += ` ${prefixCls}-menu-item-loading`;
        loadingIconNode = loadingIcon || null;
      }
      let title = '';
      if (option.title) {
        title = option.title;
      } else if (typeof option[getFieldName('label')] === 'string') {
        title = option[getFieldName('label')];
      }
      expandProps.title = title;
      expandProps.class = menuItemCls;
      return (
          <li {...expandProps}>
            {option[getFieldName('label')]}
            {expandIconNode}
            {loadingIconNode}
          </li>
      );
    };
    const getActiveOptions = (values?) => {
      const activeValue = values || $props.activeValue;
      const options = $props.options;
      return arrayTreeFilter(
          options,
          (o, level) => o[getFieldName('value')] === activeValue[level],
          {childrenKeyName: getFieldName('children')}
      );
    };
    const getShowOptions = () => {
      const {options} = $props;
      const result = getActiveOptions()
          .map(activeOption => activeOption[getFieldName('children')])
          .filter(activeOption => !!activeOption);
      result.unshift(options);
      return result;
    };
    const delayTimer = ref(null);
    const delayOnSelect = (onSelect, ...args) => {
      if (delayTimer.value) {
        clearTimeout(delayTimer.value);
        delayTimer.value = null;
      }
      if (typeof onSelect === 'function') {
        delayTimer.value = setTimeout(() => {
          onSelect(args);
          delayTimer.value = null;
        }, 150);
      }
    };
    const {getRef, saveRef} = useRefs();
    const scrollActiveItemToView = () => {
      // scroll into view
      const optionsLength = getShowOptions().length;
      for (let i = 0; i < optionsLength; i++) {
        const itemComponent = getRef(`menuItems_${i}`);
        if (itemComponent) {
          const target = itemComponent;
          target.parentNode.scrollTop = target.offsetTop;
        }
      }
    };
    const isActiveOption = (option, menuIndex) => {
      const {activeValue = []} = $props;
      return activeValue[menuIndex] === option[getFieldName('value')];
    };
    const getMenuItemRef = (index) => {
      return `menuItems_${index}`;
    };
    onMounted(() => {
      nextTick(() => {
        scrollActiveItemToView();
      });
    });

    return {
      getFieldName,
      getOption,
      getActiveOptions,
      getShowOptions,
      delayOnSelect,
      scrollActiveItemToView,
      isActiveOption,
      getMenuItemRef,
      saveRef
    };
  },
  render() {
    const {prefixCls, dropdownMenuColumnStyle} = this;
    return (
        <div>
          {this.getShowOptions().map((options, menuIndex) => (
              <ul class={`${prefixCls}-menu`} key={menuIndex} style={dropdownMenuColumnStyle}>
                {options.map(option => this.getOption(option, menuIndex))}
              </ul>
          ))}
        </div>
    );
  }
}) as any;
