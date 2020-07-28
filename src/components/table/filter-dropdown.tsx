import classNames from 'classnames';
import closest from 'dom-closest';
import shallowequal from 'shallowequal';
import {defineComponent, getCurrentInstance, nextTick, onMounted, onUpdated, ref, watch} from 'vue';
import {initDefaultProps, isValidElement} from '../_util/props-util';
import {cloneElement} from '../_util/vnode';
import Checkbox from '../checkbox';
import Dropdown from '../dropdown';
import Icon from '../icon';
import Menu from '../menu';
import Radio from '../radio';
import FilterDropdownMenuWrapper from './filter-dropdown-menu-wrapper';
import {FilterMenuProps} from './interface';
import {generateValueMaps} from './util';

const SubMenu = Menu.SubMenu;
const MenuItem = Menu.Item;

function stopPropagation(e) {
  e.stopPropagation();
}

export default defineComponent({
  name: 'FilterMenu',
  inheritAttrs: false,
  props: initDefaultProps(FilterMenuProps, {
    handleFilter() {
    },
    column: {}
  }),
  setup($props, {emit}) {
    const preProps = ref({...$props});
    const sValueKeys = ref(generateValueMaps($props.column.filters));
    const sKeyPathOfSelectedItem = ref({});
    const sVisible = ref('filterDropdownVisible' in $props.column ? $props.column.filterDropdownVisible : false);
    const neverShown = ref(false);
    const instance = getCurrentInstance();
    const sSelectedKeys = ref($props.selectedKeys);
    watch(() => sVisible.value, (v, old) => {
      instance.update();
    });
    watch(() => $props, (props) => {
      if (
          'selectedKeys' in $props &&
          !shallowequal(preProps.value.selectedKeys, $props.selectedKeys)
      ) {
        sSelectedKeys.value = $props.selectedKeys;
      }
      if (!shallowequal((preProps.value.column || {}).filters, ($props.column || {}).filters)) {
        sValueKeys.value = generateValueMaps($props.column.filters);
      }
      if ('filterDropdownVisible' in $props.column) {
        sVisible.value = $props.column.filterDropdownVisible;
      }
      preProps.value = {...$props};
    }, {deep: true});
    const getDropdownVisible = () => {
      return neverShown.value ? false : sVisible.value;
    };
    const setNeverShown = (column) => {
      const rootNode = instance.vnode.el;
      const filterBelongToScrollBody = !!closest(rootNode, `.ant-table-scroll`);
      if (filterBelongToScrollBody) {
        // When fixed column have filters, there will be two dropdown menus
        // Filter dropdown menu inside scroll body should never be shown
        // To fix https://github.com/ant-design/ant-design/issues/5010 and
        // https://github.com/ant-design/ant-design/issues/7909
        neverShown.value = !!column.fixed;
      }
    };
    const setSelectedKeys = ({selectedKeys}) => {
      sSelectedKeys.value = selectedKeys;
    };
    const setVisible = (visible) => {
      const {column} = $props;
      if (!('filterDropdownVisible' in column)) {
        sVisible.value = visible;
      }
      if (column.onFilterDropdownVisibleChange) {
        column.onFilterDropdownVisibleChange(visible);
      }
    };
    const handleClearFilters = () => {
      sSelectedKeys.value = [];
      handleConfirm();
    };
    const handleConfirm = () => {
      setVisible(false);
      confirmFilter2();
    };
    const onVisibleChange = (visible) => {
      setVisible(visible);
      const {column} = $props;
      // https://github.com/ant-design/ant-design/issues/17833
      if (!visible && !(column.filterDropdown instanceof Function)) {
        confirmFilter2();
      }
    };
    const handleMenuItemClick = (info) => {
      const selectedKeys = sSelectedKeys.value;
      if (!info.keyPath || info.keyPath.length <= 1) {
        return;
      }
      const keyPathOfSelectedItem = sKeyPathOfSelectedItem.value;
      if (selectedKeys && selectedKeys.indexOf(info.key) >= 0) {
        // deselect SubMenu child
        delete keyPathOfSelectedItem[info.key];
      } else {
        // select SubMenu child
        keyPathOfSelectedItem[info.key] = info.keyPath;
      }
      sKeyPathOfSelectedItem.value = keyPathOfSelectedItem;
    };
    const hasSubMenu = () => {
      const {
        column: {filters = []}
      } = $props;
      return filters.some(item => !!(item.children && item.children.length > 0));
    };
    const confirmFilter2 = () => {
      const {column, selectedKeys: propSelectedKeys, confirmFilter} = $props;
      const selectedKeys = sSelectedKeys.value;
      const valueKeys = sValueKeys.value;
      const {filterDropdown} = column;

      if (!shallowequal(selectedKeys, propSelectedKeys)) {
        confirmFilter(
            column,
            filterDropdown
                ? selectedKeys
                : selectedKeys.map(key => valueKeys[key]).filter(key => key !== undefined)
        );
      }
    };
    const renderMenus = (items) => {
      const {dropdownPrefixCls, prefixCls} = $props;
      return items.map(item => {
        if (item.children && item.children.length > 0) {
          const containSelected = Object.keys(sKeyPathOfSelectedItem.value).some(
              key => sKeyPathOfSelectedItem.value[key].indexOf(item.value) >= 0
          );
          const subMenuCls = classNames(`${prefixCls}-dropdown-submenu`, {
            [`${dropdownPrefixCls}-submenu-contain-selected`]: containSelected
          });
          return (
              <SubMenu title={item.text} popupClassName={subMenuCls} key={item.value.toString()}>
                {renderMenus(item.children)}
              </SubMenu>
          );
        }
        return renderMenuItem(item);
      });
    };
    const renderFilterIcon = () => {
      const {column, locale, prefixCls, selectedKeys} = $props;
      const filtered = selectedKeys && selectedKeys.length > 0;
      let filterIcon = column.filterIcon;
      if (typeof filterIcon === 'function') {
        filterIcon = filterIcon(filtered, column);
      }
      const dropdownIconClass = classNames({
        [`${prefixCls}-selected`]: filtered,
        [`${prefixCls}-open`]: getDropdownVisible()
      });
      if (!filterIcon) {
        return (
            <Icon
                title={locale.filterTitle}
                type="filter"
                theme="filled"
                class={dropdownIconClass}
                onClick={stopPropagation}
            />
        );
      }
      if (filterIcon.length === 1 && isValidElement(filterIcon[0])) {
        return cloneElement(filterIcon[0], {
          onClick: stopPropagation,
          class: classNames(`${prefixCls}-icon`, dropdownIconClass)
        });
      }
      return <span class={classNames(`${prefixCls}-icon`, dropdownIconClass)}>{filterIcon}</span>;
    };
    const renderMenuItem = (item) => {
      const {column} = $props;
      const selectedKeys = sSelectedKeys.value;
      const multiple = 'filterMultiple' in column ? column.filterMultiple : true;

      // We still need trade key as string since Menu render need string
      // const internalSelectedKeys = (selectedKeys || []).map(key => key.toString());

      const input = multiple ? (
          <Checkbox checked={selectedKeys && selectedKeys.indexOf(item.value.toString()) >= 0}/>
      ) : (
          <Radio checked={selectedKeys && selectedKeys.indexOf(item.value.toString()) >= 0}/>
      );
      return (
          <MenuItem key={item.value}>
            {input}
            <span>{item.text}</span>
          </MenuItem>
      );
    };
    onMounted(() => {
      const {column} = $props;
      nextTick(() => {
        setNeverShown(column);
      });
    });
    onUpdated(() => {
      const {column} = $props;
      nextTick(() => {
        setNeverShown(column);
      });
    });

    return {
      getDropdownVisible,
      setNeverShown,
      setSelectedKeys,
      setVisible,
      handleClearFilters,
      handleConfirm,
      onVisibleChange,
      handleMenuItemClick,
      hasSubMenu,
      confirmFilter2,
      renderMenus,
      renderFilterIcon,
      sVisible,
      renderMenuItem,
      sSelectedKeys
    };
  },
  render() {
    const originSelectedKeys = this.sSelectedKeys;
    const {column, locale, prefixCls, dropdownPrefixCls, getPopupContainer} = this;
    // default multiple selection in filter dropdown
    const multiple = 'filterMultiple' in column ? column.filterMultiple : true;
    const dropdownMenuClass = classNames({
      [`${dropdownPrefixCls}-menu-without-submenu`]: !this.hasSubMenu()
    });
    let {filterDropdown} = column;
    if (filterDropdown instanceof Function) {
      filterDropdown = filterDropdown({
        prefixCls: `${dropdownPrefixCls}-custom`,
        setSelectedKeys: selectedKeys => {
          this.setSelectedKeys({selectedKeys})
        },
        selectedKeys: originSelectedKeys,
        confirm: this.handleConfirm,
        clearFilters: this.handleClearFilters,
        filters: column.filters,
        visible: this.getDropdownVisible(),
        column
      });
    }
    const menus = filterDropdown ? (
        <FilterDropdownMenuWrapper class={`${prefixCls}-dropdown`}>
          {filterDropdown}
        </FilterDropdownMenuWrapper>
    ) : (
        <FilterDropdownMenuWrapper class={`${prefixCls}-dropdown`}>
          <Menu multiple={multiple}
                onClick={this.handleMenuItemClick}
                prefixCls={`${dropdownPrefixCls}-menu`}
                class={dropdownMenuClass}
                onSelect={(info) => {
                  this.setSelectedKeys(info)
                }}
                onDeselect={(info) => {
                  this.setSelectedKeys(info)
                }}
                selectedKeys={originSelectedKeys && originSelectedKeys.map(val => val.toString())}
                getPopupContainer={getPopupContainer}>
            {this.renderMenus(column.filters)}
          </Menu>
          <div class={`${prefixCls}-dropdown-btns`}>
            <a class={`${prefixCls}-dropdown-link confirm`} onClick={this.handleConfirm}>
              {locale.filterConfirm}
            </a>
            <a class={`${prefixCls}-dropdown-link clear`} onClick={this.handleClearFilters}>
              {locale.filterReset}
            </a>
          </div>
        </FilterDropdownMenuWrapper>
    );
    return (
        <Dropdown trigger={['click']}
                  placement="bottomRight"
                  visible={this.getDropdownVisible()}
                  onVisibleChange={this.onVisibleChange}
                  getPopupContainer={getPopupContainer}
                  forceRender={true}>
          <template slot="overlay">{menus}</template>
          {this.renderFilterIcon()}
        </Dropdown>
    );
  }
}) as any;
