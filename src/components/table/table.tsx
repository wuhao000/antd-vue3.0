import {useRefs} from '@/components/vc-tabs/src/save-ref';
import classNames from 'classnames';
import shallowEqual from 'shallowequal';
import {defineComponent, getCurrentInstance, onUpdated, ref, watch} from 'vue';
import {getListenersFromInstance, getOptionProps, initDefaultProps, mergeProps} from '../_util/props-util';
import scrollTo from '../_util/scrollTo';
import TransButton from '../_util/transButton';
import warning from '../_util/warning';
import {useConfigProvider} from '../config-provider';
import Icon from '../icon';
import defaultLocale from '../locale-provider/default';
import LocaleReceiver from '../locale-provider/locale-receiver';
import Pagination from '../pagination';
import Spin from '../spin';
import VcTable, {INTERNAL_COL_DEFINE} from '../vc-table';
import Column from './column';
import ColumnGroup from './column-group';
import createBodyRow from './create-body-row';
import createStore from './create-store';
import FilterDropdown from './filter-dropdown';
import {TableProps} from './interface';
import SelectionBox from './selection-box';
import SelectionCheckboxAll from './selection-checkbox-all';
import {flatArray, flatFilter, treeMap} from './util';

function noop() {
}

function stopPropagation(e) {
  e.stopPropagation();
}

function getRowSelection(props) {
  return props.rowSelection || {};
}

function getColumnKey(column, index?) {
  return column.key || column.dataIndex || index;
}

function isSameColumn(a, b) {
  if (a && b && a.key && a.key === b.key) {
    return true;
  }
  return (
      a === b ||
      shallowEqual(a, b, (value, other) => {
        // https://github.com/ant-design/ant-design/issues/12737
        if (typeof value === 'function' && typeof other === 'function') {
          return value === other || value.toString() === other.toString();
        }
        // https://github.com/ant-design/ant-design/issues/19398
        if (Array.isArray(value) && Array.isArray(other)) {
          return value === other || shallowEqual(value, other);
        }
      })
  );
}

const defaultPagination = {
  onChange: noop,
  onShowSizeChange: noop
};

/**
 * Avoid creating new object, so that parent component's shouldComponentUpdate
 * can works appropriately。
 */
const emptyObject = {};

const createComponents = (components: any = {}) => {
  const bodyRow = components && components.body && components.body.row;
  return {
    ...components,
    body: {
      ...components.body,
      row: createBodyRow(bodyRow)
    }
  };
};

function isTheSameComponents(components1 = {}, components2 = {}) {
  return (
      components1 === components2 ||
      ['table', 'header', 'body'].every(key => shallowEqual(components1[key], components2[key]))
  );
}

function getFilteredValueColumns(state, columns?) {
  return flatFilter(
      columns || (state || {}).columns || [],
      column => typeof column.filteredValue !== 'undefined'
  );
}

function getFiltersFromColumns(state, columns) {
  const filters = {};
  getFilteredValueColumns(state, columns).forEach(col => {
    const colKey = getColumnKey(col);
    filters[colKey] = col.filteredValue;
  });
  return filters;
}

function isFiltersChanged(state, filters) {
  if (Object.keys(filters).length !== Object.keys(state.filters).length) {
    return true;
  }
  return Object.keys(filters).some(columnKey => filters[columnKey] !== state.filters[columnKey]);
}

export default defineComponent({
  name: 'Table',
  Column,
  ColumnGroup,
  props: initDefaultProps(TableProps, {
    dataSource: [],
    useFixedHeader: false,
    // rowSelection: null,
    size: 'default',
    loading: false,
    bordered: false,
    indentSize: 20,
    locale: {},
    rowKey: 'key',
    showHeader: true,
    sortDirections: ['ascend', 'descend'],
    childrenColumnName: 'children'
  }),
  setup($props, {emit}) {
    const hasPagination = (props?) => {
      return (props || $props).pagination !== false;
    };
    const getDefaultPagination = (props) => {
      const pagination = typeof props.pagination === 'object' ? props.pagination : {};
      let current;
      if ('current' in pagination) {
        current = pagination.current;
      } else if ('defaultCurrent' in pagination) {
        current = pagination.defaultCurrent;
      }
      let pageSize;
      if ('pageSize' in pagination) {
        pageSize = pagination.pageSize;
      } else if ('defaultPageSize' in pagination) {
        pageSize = pagination.defaultPageSize;
      }
      return hasPagination(props)
          ? {
            ...defaultPagination,
            ...pagination,
            current: current || 1,
            pageSize: pageSize || 10
          }
          : {};
    };
    const getDefaultFilters = (columns) => {
      const definedFilters = getFiltersFromColumns({columns: $props.columns}, columns);

      const defaultFilteredValueColumns = flatFilter(
          columns || [],
          column => typeof column.defaultFilteredValue !== 'undefined'
      );

      const defaultFilters = defaultFilteredValueColumns.reduce((soFar, col) => {
        const colKey = getColumnKey(col);
        soFar[colKey] = col.defaultFilteredValue;
        return soFar;
      }, {});

      return {...defaultFilters, ...definedFilters};
    };
    const getSortOrderColumns = (columns) => {
      return flatFilter(columns || $props.columns || [], column => 'sortOrder' in column);
    };
    const getSortStateFromColumns = (columns): any => {
      // return first column which sortOrder is not falsy
      const sortedColumn = getSortOrderColumns(columns).filter(col => col.sortOrder)[0];
      if (sortedColumn) {
        return {
          sSortColumn: sortedColumn,
          sSortOrder: sortedColumn.sortOrder
        };
      }
      return {
        sSortColumn: null,
        sSortOrder: null
      };
    };
    const getDefaultSortOrder = (columns) => {
      const definedSortState = getSortStateFromColumns(columns);
      const defaultSortedColumn = flatFilter(columns || [], column => {
        return column.defaultSortOrder !== null;
      })[0];
      if (defaultSortedColumn && !definedSortState.sortColumn) {
        return {
          sSortColumn: defaultSortedColumn,
          sSortOrder: defaultSortedColumn.defaultSortOrder
        };
      }
      return definedSortState;
    };
    const defaultSortOrder = getDefaultSortOrder($props.columns);
    const sSortColumn = ref(defaultSortOrder.sSortColumn);
    const sSortOrder = ref(defaultSortOrder.sSortOrder);
    const sPagination = ref(getDefaultPagination($props));
    const pivot = ref(undefined);
    const sComponents = ref(createComponents($props.components));
    const sFilters = ref(getDefaultFilters($props.columns));
    const store = createStore({
      selectedRowKeys: getRowSelection($props).selectedRowKeys || [],
      selectionDirty: false
    });
    let CheckboxPropsCache = {};
    watch(() => $props.dataSource, () => {
      store.setState({
        selectionDirty: false
      });
      CheckboxPropsCache = {};
    });
    watch(() => $props.components, (val, oldVal) => {
      if (!isTheSameComponents(val, oldVal)) {
        sComponents.value = createComponents(val);
      }
    }, {deep: true});
    watch(() => $props.columns, (val) => {
      const filteredValueColumns = getFilteredValueColumns({columns: val}, val);
      if (filteredValueColumns.length > 0) {
        const filtersFromColumns = getFiltersFromColumns({columns: val}, val);
        const newFilters = {...sFilters.value};
        Object.keys(filtersFromColumns).forEach(key => {
          newFilters[key] = filtersFromColumns[key];
        });
        if (isFiltersChanged({filters: sFilters.value}, newFilters)) {
          sFilters.value = newFilters;
        }
      }
    });
    watch(() => $props.rowSelection, (val, oldVal) => {
      if (val && 'selectedRowKeys' in val) {
        store.setState({
          selectedRowKeys: val.selectedRowKeys || []
        });
        const {rowSelection} = $props;
        if (rowSelection && val.getCheckboxProps !== rowSelection.getCheckboxProps) {
          CheckboxPropsCache = {};
        }
      } else if (oldVal && !val) {
        store.setState({
          selectedRowKeys: []
        });
      }
    }, {deep: true});
    watch(() => $props.pagination, (val) => {
      const newPagination = {
        ...defaultPagination,
        ...sPagination.value,
        ...val
      };
      newPagination.current = newPagination.current || 1;
      newPagination.pageSize = newPagination.pageSize || 10;
      sPagination.value = val === false ? emptyObject : newPagination;
    }, {deep: true});
    const getCheckboxPropsByItem = (item, index) => {
      const rowSelection = getRowSelection($props);
      if (!rowSelection.getCheckboxProps) {
        return {props: {}};
      }
      const key = getRecordKey(item, index);
      // Cache checkboxProps
      if (!CheckboxPropsCache[key]) {
        CheckboxPropsCache[key] = rowSelection.getCheckboxProps(item);
      }
      CheckboxPropsCache[key].props = CheckboxPropsCache[key].props || {};
      return CheckboxPropsCache[key];
    };
    const getDefaultSelection = () => {
      const rowSelection = getRowSelection($props);
      if (!rowSelection.getCheckboxProps) {
        return [];
      }
      return getFlatData()
          .filter(
              (item, rowIndex) => getCheckboxPropsByItem(item, rowIndex).props.defaultChecked
          )
          .map((record, rowIndex) => getRecordKey(record, rowIndex));
    };
    const getMaxCurrent = (total) => {
      const {current, pageSize} = sPagination.value;
      if ((current - 1) * pageSize >= total) {
        return Math.floor((total - 1) / pageSize) + 1;
      }
      return current;
    };
    const getRecordKey = (record, index) => {
      const {rowKey} = $props;
      const recordKey = typeof rowKey === 'function' ? rowKey(record, index) : record[rowKey];
      warning(
          recordKey !== undefined,
          'Table',
          'Each record in dataSource of table should have a unique `key` prop, ' +
          'or set `rowKey` of Table to an unique primary key, '
      );
      return recordKey === undefined ? index : recordKey;
    };
    const getSorterFn = (state?: { sSortOrder: any, sSortColumn: any }) => {
      const sortOrder = state ? state.sSortOrder : sSortOrder.value;
      const sortColumn = state ? state.sSortColumn : sSortColumn.value;
      if (!sortOrder || !sortColumn || typeof sortColumn.sorter !== 'function') {
        return;
      }

      return (a, b) => {
        const result = sortColumn.sorter(a, b, sortOrder);
        if (result !== 0) {
          return sortOrder === 'descend' ? -result : result;
        }
        return 0;
      };
    };
    const getCurrentPageData = () => {
      let data = getLocalData();
      let current;
      let pageSize;
      const sPaginationV = sPagination.value;
      // 如果没有分页的话，默认全部展示
      if (hasPagination()) {
        pageSize = sPaginationV.pageSize;
        current = getMaxCurrent(sPaginationV.total || data.length);
      } else {
        pageSize = Number.MAX_VALUE;
        current = 1;
      }

      // 分页
      // ---
      // 当数据量少于等于每页数量时，直接设置数据
      // 否则进行读取分页数据
      if (data.length > pageSize || pageSize === Number.MAX_VALUE) {
        data = data.slice((current - 1) * pageSize, current * pageSize);
      }
      return data;
    };
    const getFlatData = () => {
      const {childrenColumnName} = $props;
      return flatArray(getLocalData(null, false), childrenColumnName);
    };
    const getFlatCurrentPageData = () => {
      const {childrenColumnName} = $props;
      return flatArray(getCurrentPageData(), childrenColumnName);
    };
    const getLocalData = (state?, filter = true) => {
      const filters = state ? state.sFilters : sFilters.value;
      const sortOrder = state ? state.sSortOrder : sSortOrder.value;
      const sortColumn = state ? state.sSortColumn : sSortColumn.value;
      const {dataSource} = $props;
      let data = dataSource || [];
      // 优化本地排序
      data = data.slice(0);
      const sorterFn = getSorterFn({sSortColumn: sortColumn, sSortOrder: sortOrder});
      if (sorterFn) {
        data = recursiveSort(data, sorterFn);
      }
      // 筛选
      if (filter && filters) {
        Object.keys(filters).forEach(columnKey => {
          const col = findColumn(columnKey);
          if (!col) {
            return;
          }
          const values = filters[columnKey] || [];
          if (values.length === 0) {
            return;
          }
          const onFilter = col.onFilter;
          data = onFilter
              ? data.filter(record => {
                return values.some(v => onFilter(v, record));
              })
              : data;
        });
      }
      return data;
    };
    const onRow = (prefixCls, record, index) => {
      const {customRow} = $props;
      const custom = customRow ? customRow(record, index) : {};
      return mergeProps(custom, {
        props: {
          prefixCls,
          store,
          rowKey: getRecordKey(record, index)
        }
      });
    };
    const setSelectedRowKeys = (selectedRowKeys, selectionInfo) => {
      const {selectWay, record, checked, changeRowKeys, nativeEvent} = selectionInfo;
      const rowSelection = getRowSelection($props);
      if (rowSelection && !('selectedRowKeys' in rowSelection)) {
        store.setState({selectedRowKeys});
      }
      const data = getFlatData();
      if (!rowSelection.onChange && !rowSelection[selectWay]) {
        return;
      }
      const selectedRows = data.filter(
          (row, i) => selectedRowKeys.indexOf(getRecordKey(row, i)) >= 0
      );
      if (rowSelection.onChange) {
        rowSelection.onChange(selectedRowKeys, selectedRows);
      }
      if (selectWay === 'onSelect' && rowSelection.onSelect) {
        rowSelection.onSelect(record, checked, selectedRows, nativeEvent);
      } else if (selectWay === 'onSelectMultiple' && rowSelection.onSelectMultiple) {
        const changeRows = data.filter(
            (row, i) => changeRowKeys.indexOf(getRecordKey(row, i)) >= 0
        );
        rowSelection.onSelectMultiple(checked, selectedRows, changeRows);
      } else if (selectWay === 'onSelectAll' && rowSelection.onSelectAll) {
        const changeRows = data.filter(
            (row, i) => changeRowKeys.indexOf(getRecordKey(row, i)) >= 0
        );
        rowSelection.onSelectAll(checked, selectedRows, changeRows);
      } else if (selectWay === 'onSelectInvert' && rowSelection.onSelectInvert) {
        rowSelection.onSelectInvert(selectedRowKeys);
      }
    };
    const {getRef, saveRef} = useRefs();
    const generatePopupContainerFunc = (getPopupContainer) => {
      const {scroll} = $props;
      const table = getRef('vcTable');
      if (getPopupContainer) {
        return getPopupContainer;
      }
      // Use undefined to let rc component use default logic.
      return scroll && table ? () => table.getTableNode() : undefined;
    };
    const scrollToFirstRow = () => {
      const {scroll} = $props;
      if (scroll && scroll.scrollToFirstRowOnChange !== false) {
        scrollTo(0, {
          getContainer: () => {
            return getRef('vcTable').getBodyTable();
          }
        });
      }
    };
    const isSameColumn = (a, b) => {
      if (a && b && a.key && a.key === b.key) {
        return true;
      }
      return (
          a === b ||
          shallowEqual(a, b, (value, other) => {
            if (typeof value === 'function' && typeof other === 'function') {
              return value === other || value.toString() === other.toString();
            }
          })
      );
    };
    const handleFilter = (column, nextFilters) => {
      const pagination = {...sPagination.value};
      const filters = {
        ...sFilters.value,
        [getColumnKey(column)]: nextFilters
      };
      // Remove filters not in current columns
      const currentColumnKeys = [];
      treeMap($props.columns, c => {
        if (!c.children) {
          currentColumnKeys.push(getColumnKey(c));
        }
      });
      Object.keys(filters).forEach(columnKey => {
        if (currentColumnKeys.indexOf(columnKey) < 0) {
          delete filters[columnKey];
        }
      });

      if ($props.pagination) {
        // Reset current prop
        pagination.current = 1;
        pagination.onChange(pagination.current);
      }

      sPagination.value = pagination;
      sFilters.value = {};
      const filtersToSetState = {...filters};
      // Remove filters which is controlled
      getFilteredValueColumns({columns: $props.columns}).forEach(col => {
        const columnKey = getColumnKey(col);
        if (columnKey) {
          delete filtersToSetState[columnKey];
        }
      });
      if (Object.keys(filtersToSetState).length > 0) {
        sFilters.value = filtersToSetState;
      }

      // Controlled current prop will not respond user interaction
      if (typeof $props.pagination === 'object' && 'current' in $props.pagination) {
        sPagination.value = {
          ...pagination,
          current: sPagination.value.current
        };
      }
      scrollToFirstRow();
      store.setState({
        selectionDirty: false
      });
      emit(
          'change',
          ...prepareParamsArguments({
            sSortOrder: sSortOrder.value,
            sSortColumn: sSortColumn.value,
            sFilters: filters,
            sPagination: pagination
          })
      );
    };
    const handleSelect = (record, rowIndex, e) => {
      const checked = e.target.checked;
      const nativeEvent = e.nativeEvent;
      const defaultSelection = store.getState().selectionDirty
          ? []
          : getDefaultSelection();
      let selectedRowKeys = store.getState().selectedRowKeys.concat(defaultSelection);
      const key = getRecordKey(record, rowIndex);
      const rows = getFlatCurrentPageData();
      let realIndex = rowIndex;
      if ($props.expandedRowRender) {
        realIndex = rows.findIndex(row => getRecordKey(row, rowIndex) === key);
      }
      if (nativeEvent.shiftKey && pivot.value !== undefined && realIndex !== pivot.value) {
        const changeRowKeys = [];
        const direction = Math.sign(pivot.value - realIndex);
        const dist = Math.abs(pivot.value - realIndex);
        let step = 0;
        while (step <= dist) {
          const i = realIndex + step * direction;
          step += 1;
          const row = rows[i];
          const rowKey = getRecordKey(row, i);
          const checkboxProps = getCheckboxPropsByItem(row, i);
          if (!checkboxProps.disabled) {
            if (selectedRowKeys.includes(rowKey)) {
              if (!checked) {
                selectedRowKeys = selectedRowKeys.filter(j => rowKey !== j);
                changeRowKeys.push(rowKey);
              }
            } else if (checked) {
              selectedRowKeys.push(rowKey);
              changeRowKeys.push(rowKey);
            }
          }
        }
        pivot.value = realIndex;
        store.setState({
          selectionDirty: true
        });
        setSelectedRowKeys(selectedRowKeys, {
          selectWay: 'onSelectMultiple',
          record,
          checked,
          changeRowKeys,
          nativeEvent
        });
      } else {
        if (checked) {
          selectedRowKeys.push(getRecordKey(record, realIndex));
        } else {
          selectedRowKeys = selectedRowKeys.filter(i => key !== i);
        }
        pivot.value = realIndex;
        store.setState({
          selectionDirty: true
        });
        setSelectedRowKeys(selectedRowKeys, {
          selectWay: 'onSelect',
          record,
          checked,
          changeRowKeys: undefined,
          nativeEvent
        });
      }
    };
    const handleRadioSelect = (record, rowIndex, e) => {
      const checked = e.target.checked;
      const nativeEvent = e.nativeEvent;
      const key = getRecordKey(record, rowIndex);
      const selectedRowKeys = [key];
      store.setState({
        selectionDirty: true
      });
      setSelectedRowKeys(selectedRowKeys, {
        selectWay: 'onSelect',
        record,
        checked,
        changeRowKeys: undefined,
        nativeEvent
      });
    };
    const handleSelectRow = (selectionKey, index, onSelectFunc) => {
      const data = getFlatCurrentPageData();
      const defaultSelection = store.getState().selectionDirty
          ? []
          : getDefaultSelection();
      const selectedRowKeys = store.getState().selectedRowKeys.concat(defaultSelection);
      const changeableRowKeys = data
          .filter((item, i) => !getCheckboxPropsByItem(item, i).props.disabled)
          .map((item, i) => getRecordKey(item, i));

      const changeRowKeys = [];
      let selectWay = 'onSelectAll';
      let checked;
      // handle default selection
      switch (selectionKey) {
        case 'all':
          changeableRowKeys.forEach(key => {
            if (selectedRowKeys.indexOf(key) < 0) {
              selectedRowKeys.push(key);
              changeRowKeys.push(key);
            }
          });
          selectWay = 'onSelectAll';
          checked = true;
          break;
        case 'removeAll':
          changeableRowKeys.forEach(key => {
            if (selectedRowKeys.indexOf(key) >= 0) {
              selectedRowKeys.splice(selectedRowKeys.indexOf(key), 1);
              changeRowKeys.push(key);
            }
          });
          selectWay = 'onSelectAll';
          checked = false;
          break;
        case 'invert':
          changeableRowKeys.forEach(key => {
            if (selectedRowKeys.indexOf(key) < 0) {
              selectedRowKeys.push(key);
            } else {
              selectedRowKeys.splice(selectedRowKeys.indexOf(key), 1);
            }
            changeRowKeys.push(key);
            selectWay = 'onSelectInvert';
          });
          break;
        default:
          break;
      }

      store.setState({
        selectionDirty: true
      });
      // when select custom selection, callback selections[n].onSelect
      const {rowSelection} = $props;
      let customSelectionStartIndex = 2;
      if (rowSelection && rowSelection.hideDefaultSelections) {
        customSelectionStartIndex = 0;
      }
      if (index >= customSelectionStartIndex && typeof onSelectFunc === 'function') {
        return onSelectFunc(changeableRowKeys);
      }
      setSelectedRowKeys(selectedRowKeys, {
        selectWay,
        checked,
        changeRowKeys
      });
    };
    const handlePageChange = (current, ...otherArguments) => {
      const props = $props;
      const pagination = {...sPagination.value};
      if (current) {
        pagination.current = current;
      } else {
        pagination.current = pagination.current || 1;
      }
      pagination.onChange(pagination.current, ...otherArguments);

      const newState = {
        sPagination: pagination
      };
      // Controlled current prop will not respond user interaction
      if (
          props.pagination &&
          typeof props.pagination === 'object' &&
          'current' in props.pagination
      ) {
        newState.sPagination = {
          ...pagination,
          current: sPagination.value.current
        };
      }
      this.setState(newState, this.scrollToFirstRow);

      store.setState({
        selectionDirty: false
      });
      emit(
          'change',
          ...prepareParamsArguments({
            sFilters: sFilters.value,
            sSortColumn: sSortColumn.value,
            sSortOrder: sSortOrder.value,
            sPagination: pagination
          })
      );
    };
    const handleShowSizeChange = (current, pageSize) => {
      const pagination = sPagination.value;
      pagination.onShowSizeChange(current, pageSize);
      const nextPagination = {
        ...pagination,
        pageSize,
        current
      };
      this.setState({sPagination: nextPagination}, this.scrollToFirstRow);
      emit(
          'change',
          ...prepareParamsArguments({
            ...this.$data,
            sPagination: nextPagination
          })
      );
    };
    const toggleSortOrder = (column) => {
      const sortDirections = column.sortDirections || this.sortDirections;
      const {sSortOrder: sortOrder, sSortColumn: sortColumn} = this;
      // 只同时允许一列进行排序，否则会导致排序顺序的逻辑问题
      let newSortOrder;
      // 切换另一列时，丢弃 sortOrder 的状态
      if (isSameColumn(sortColumn, column) && sortOrder !== undefined) {
        // 按照sortDirections的内容依次切换排序状态
        const methodIndex = sortDirections.indexOf(sortOrder) + 1;
        newSortOrder =
            methodIndex === sortDirections.length ? undefined : sortDirections[methodIndex];
      } else {
        newSortOrder = sortDirections[0];
      }
      const newState = {
        sSortOrder: newSortOrder,
        sSortColumn: newSortOrder ? column : null
      };

      // Controlled
      if (this.getSortOrderColumns().length === 0) {
        this.setState(newState, this.scrollToFirstRow);
      }
      this.$emit(
          'change',
          ...this.prepareParamsArguments(
              {
                ...this.$data,
                ...newState
              },
              column
          )
      );
    };
    const isSortColumn = (column) => {
      const {sSortColumn: sortColumn} = this;
      if (!column || !sortColumn) {
        return false;
      }
      return getColumnKey(sortColumn) === getColumnKey(column);
    };
    const prepareParamsArguments = (state: {
                                      sPagination: any;
                                      sSortColumn: any;
                                      sSortOrder: any;
                                      sFilters: any
                                    },
                                    column?) => {
      const pagination = {...state.sPagination};
      // remove useless handle function in Table.onChange
      delete pagination.onChange;
      delete pagination.onShowSizeChange;
      const filters = state.sFilters;
      const sorter: any = {};
      let currentColumn = column;
      if (state.sSortColumn && state.sSortOrder) {
        currentColumn = state.sSortColumn;
        sorter.column = state.sSortColumn;
        sorter.order = state.sSortOrder;
      }

      if (currentColumn) {
        sorter.field = currentColumn.dataIndex;
        sorter.columnKey = getColumnKey(currentColumn);
      }

      const extra = {
        currentDataSource: getLocalData(state)
      };

      return [pagination, filters, sorter, extra];
    };
    const findColumn = (myKey) => {
      let column;
      treeMap(this.columns, c => {
        if (getColumnKey(c) === myKey) {
          column = c;
        }
      });
      return column;
    };
    const recursiveSort = (data, sorterFn) => {
      const {childrenColumnName = 'children'} = this;
      return data.sort(sorterFn).map(item =>
          item[childrenColumnName]
              ? {
                ...item,
                [childrenColumnName]: this.recursiveSort(item[childrenColumnName], sorterFn)
              }
              : item
      );
    };
    const renderExpandIcon = (prefixCls) => {
      return ({expandable, expanded, needIndentSpaced, record, onExpand}) => {
        if (expandable) {
          return (
              <LocaleReceiver componentName="Table" defaultLocale={defaultLocale.Table}>
                {locale => (
                    <TransButton
                        class={classNames(`${prefixCls}-row-expand-icon`, {
                          [`${prefixCls}-row-collapsed`]: !expanded,
                          [`${prefixCls}-row-expanded`]: expanded
                        })}
                        onClick={event => {
                          onExpand(record, event);
                        }}
                        aria-label={expanded ? locale.collapse : locale.expand}
                        noStyle={true}
                    />
                )}
              </LocaleReceiver>
          );
        }

        if (needIndentSpaced) {
          return <span class={`${prefixCls}-row-expand-icon ${prefixCls}-row-spaced`}/>;
        }

        return null;
      };
    };
    const renderPagination = (prefixCls, paginationPosition) => {
      // 强制不需要分页
      if (!hasPagination()) {
        return null;
      }
      let size = 'default';
      const pagination = sPagination.value;
      if (pagination.size) {
        size = pagination.size;
      } else if ($props.size === 'middle' || $props.size === 'small') {
        size = 'small';
      }
      const position = pagination.position || 'bottom';
      const total = pagination.total || getLocalData().length;
      const {class: cls, style, onChange, onShowSizeChange, ...restProps} = pagination; // eslint-disable-line
      const paginationProps = mergeProps({
        key: `pagination-${paginationPosition}`,
        class: classNames(cls, `${prefixCls}-pagination`),
        ...restProps,
        total,
        size,
        current: getMaxCurrent(total),
        style,
        onChange: handlePageChange,
        onShowSizeChange: handleShowSizeChange
      });
      return total > 0 && (position === paginationPosition || position === 'both') ? (
          <Pagination {...paginationProps} />
      ) : null;
    };
    const renderSelectionBox = (type) => {
      return (_, record, index) => {
        const rowKey = getRecordKey(record, index); // 从 1 开始
        const props = getCheckboxPropsByItem(record, index);
        const handleChange = e => {
          type === 'radio'
              ? handleRadioSelect(record, index, e)
              : handleSelect(record, index, e);
        };
        const selectionBoxProps = mergeProps(
            {
              type,
              store,
              rowIndex: rowKey,
              defaultSelection: getDefaultSelection(),
              onChange: handleChange
            },
            props
        );

        return (
            <span onClick={stopPropagation}>
              <SelectionBox {...selectionBoxProps} />
            </span>
        );
      };
    };
    const renderRowSelection = ({prefixCls, locale, getPopupContainer}) => {
      const {rowSelection} = $props;
      const columns = $props.columns.concat();
      if (rowSelection) {
        const data = getFlatCurrentPageData().filter((item, index) => {
          if (rowSelection.getCheckboxProps) {
            return !getCheckboxPropsByItem(item, index).props.disabled;
          }
          return true;
        });
        const selectionColumnClass = classNames(`${prefixCls}-selection-column`, {
          [`${prefixCls}-selection-column-custom`]: rowSelection.selections
        });
        const selectionColumn = {
          key: 'selection-column',
          customRender: renderSelectionBox(rowSelection.type),
          className: selectionColumnClass,
          fixed: rowSelection.fixed,
          width: rowSelection.columnWidth,
          title: rowSelection.columnTitle,
          [INTERNAL_COL_DEFINE]: {
            class: `${prefixCls}-selection-col`
          }
        };
        if (rowSelection.type !== 'radio') {
          const checkboxAllDisabled = data.every(
              (item, index) => getCheckboxPropsByItem(item, index).props.disabled
          );
          selectionColumn.title = selectionColumn.title || (
              <SelectionCheckboxAll
                  store={this.store}
                  locale={locale}
                  data={data}
                  getCheckboxPropsByItem={this.getCheckboxPropsByItem}
                  getRecordKey={this.getRecordKey}
                  disabled={checkboxAllDisabled}
                  prefixCls={prefixCls}
                  onSelect={this.handleSelectRow}
                  selections={rowSelection.selections}
                  hideDefaultSelections={rowSelection.hideDefaultSelections}
                  getPopupContainer={this.generatePopupContainerFunc(getPopupContainer)}
              />
          );
        }
        if ('fixed' in rowSelection) {
          selectionColumn.fixed = rowSelection.fixed;
        } else if (columns.some(column => column.fixed === 'left' || column.fixed === true)) {
          selectionColumn.fixed = 'left';
        }
        if (columns[0] && columns[0].key === 'selection-column') {
          columns[0] = selectionColumn;
        } else {
          columns.unshift(selectionColumn);
        }
      }
      return columns;
    };
    const renderColumnsDropdown = ({prefixCls, dropdownPrefixCls, columns, locale, getPopupContainer}) => {
      const sortOrder = sSortOrder.value;
      const filters = sFilters.value;
      return treeMap(columns, (column, i) => {
        const key = getColumnKey(column, i);
        let filterDropdown;
        let sortButton;
        let customHeaderCell = column.customHeaderCell;
        const isSortColumnV = isSortColumn(column);
        if ((column.filters && column.filters.length > 0) || column.filterDropdown) {
          const colFilters = key in filters ? filters[key] : [];
          filterDropdown = (
              <FilterDropdown
                  _propsSymbol={Symbol()}
                  locale={locale}
                  column={column}
                  selectedKeys={colFilters}
                  confirmFilter={handleFilter}
                  prefixCls={`${prefixCls}-filter`}
                  dropdownPrefixCls={dropdownPrefixCls || 'ant-dropdown'}
                  getPopupContainer={generatePopupContainerFunc(getPopupContainer)}
                  key="filter-dropdown"
              />
          );
        }
        if (column.sorter) {
          const sortDirections = column.sortDirections || this.sortDirections;
          const isAscend = isSortColumnV && sortOrder === 'ascend';
          const isDescend = isSortColumnV && sortOrder === 'descend';
          const ascend = sortDirections.indexOf('ascend') !== -1 && (
              <Icon
                  class={`${prefixCls}-column-sorter-up ${isAscend ? 'on' : 'off'}`}
                  type="caret-up"
                  theme="filled"
                  key="caret-up"
              />
          );

          const descend = sortDirections.indexOf('descend') !== -1 && (
              <Icon
                  class={`${prefixCls}-column-sorter-down ${isDescend ? 'on' : 'off'}`}
                  type="caret-down"
                  theme="filled"
                  key="caret-down"
              />
          );

          sortButton = (
              <div
                  title={locale.sortTitle}
                  class={classNames(
                      `${prefixCls}-column-sorter-inner`,
                      ascend && descend && `${prefixCls}-column-sorter-inner-full`
                  )}
                  key="sorter"
              >
                {ascend}
                {descend}
              </div>
          );
          customHeaderCell = col => {
            let colProps = {};
            // Get original first
            if (column.customHeaderCell) {
              colProps = {
                ...column.customHeaderCell(col)
              };
            }
            colProps.on = colProps.on || {};
            // Add sorter logic
            const onHeaderCellClick = colProps.on.click;
            colProps.on.click = (...args) => {
              this.toggleSortOrder(column);
              if (onHeaderCellClick) {
                onHeaderCellClick(...args);
              }
            };
            return colProps;
          };
        }
        return {
          ...column,
          className: classNames(column.className, {
            [`${prefixCls}-column-has-actions`]: sortButton || filterDropdown,
            [`${prefixCls}-column-has-filters`]: filterDropdown,
            [`${prefixCls}-column-has-sorters`]: sortButton,
            [`${prefixCls}-column-sort`]: isSortColumnV && sortOrder
          }),
          title: [
            <span key="title" class={`${prefixCls}-header-column`}>
              <div class={sortButton ? `${prefixCls}-column-sorters` : undefined}>
                <span class={`${prefixCls}-column-title`}>
                  {this.renderColumnTitle(column.title)}
                </span>
                <span class={`${prefixCls}-column-sorter`}>{sortButton}</span>
              </div>
            </span>,
            filterDropdown
          ],
          customHeaderCell
        };
      });
    };
    const renderColumnTitle = (title) => {
      const {sFilters: filters, sSortOrder: sortOrder, sSortColumn: sortColumn} = this.$data;
      // https://github.com/ant-design/ant-design/issues/11246#issuecomment-405009167
      if (title instanceof Function) {
        return title({
          filters,
          sortOrder,
          sortColumn
        });
      }
      return title;
    };
    const renderTable = ({
                           prefixCls,
                           renderEmpty,
                           dropdownPrefixCls,
                           contextLocale,
                           getPopupContainer: contextGetPopupContainer,
                           transformCellText
                         }) => {
      const {showHeader, locale, getPopupContainer, ...restProps} = $props;
      const data = getCurrentPageData();
      const expandIconAsCell = $props.expandedRowRender && $props.expandIconAsCell !== false;
      // use props.getPopupContainer first
      const realGetPopupContainer = getPopupContainer || contextGetPopupContainer;

      // Merge too locales
      const mergedLocale = {...contextLocale, ...locale};
      if (!locale || !locale.emptyText) {
        mergedLocale.emptyText = renderEmpty('Table');
      }

      const classString = classNames({
        [`${prefixCls}-${$props.size}`]: true,
        [`${prefixCls}-bordered`]: $props.bordered,
        [`${prefixCls}-empty`]: !data.length,
        [`${prefixCls}-without-column-header`]: !showHeader
      });

      const columnsWithRowSelection = renderRowSelection({
        prefixCls,
        locale: mergedLocale,
        getPopupContainer: realGetPopupContainer
      });
      const columns = renderColumnsDropdown({
        columns: columnsWithRowSelection,
        prefixCls,
        dropdownPrefixCls,
        locale: mergedLocale,
        getPopupContainer: realGetPopupContainer
      }).map((column, i) => {
        const newColumn = {...column};
        newColumn.key = getColumnKey(newColumn, i);
        return newColumn;
      });

      let expandIconColumnIndex = columns[0] && columns[0].key === 'selection-column' ? 1 : 0;
      if ('expandIconColumnIndex' in restProps) {
        expandIconColumnIndex = restProps.expandIconColumnIndex;
      }
      const instance = getCurrentInstance();
      const vcTableProps = {
        key: 'table',
        expandIcon: renderExpandIcon(prefixCls),
        ...restProps,
        customRow: (record, index) => onRow(prefixCls, record, index),
        components: sComponents.value,
        prefixCls,
        data,
        columns,
        showHeader,
        expandIconColumnIndex,
        expandIconAsCell,
        emptyText: mergedLocale.emptyText,
        transformCellText,
        ...getListenersFromInstance(instance),
        class: classString,
        ref: saveRef('vcTable')
      };
      return <VcTable {...vcTableProps} />;
    };
    onUpdated(() => {
      const {columns, sSortColumn: sortColumn, sSortOrder: sortOrder} = this;
      if (getSortOrderColumns(columns).length > 0) {
        const sortState = getSortStateFromColumns(columns);
        if (!isSameColumn(sortState.sSortColumn, sortColumn) || sortState.sSortOrder !== sortOrder) {
          this.setState(sortState);
        }
      }
    });

    return {
      getCheckboxPropsByItem,
      getDefaultSelection,
      getDefaultPagination,
      getSortOrderColumns,
      getDefaultFilters,
      getDefaultSortOrder,
      getSortStateFromColumns,
      getMaxCurrent,
      getRecordKey,
      getSorterFn,
      getCurrentPageData,
      getFlatData,
      getFlatCurrentPageData,
      getLocalData,
      onRow,
      getRef,
      saveRef,
      setSelectedRowKeys,
      generatePopupContainerFunc,
      scrollToFirstRow,
      isSameColumn,
      handleFilter,
      handleSelect,
      handleRadioSelect,
      handleSelectRow,
      handlePageChange,
      handleShowSizeChange,
      toggleSortOrder,
      hasPagination,
      isSortColumn,
      prepareParamsArguments,
      findColumn,
      recursiveSort,
      renderExpandIcon,
      renderPagination,
      renderSelectionBox,
      renderRowSelection,
      renderColumnsDropdown,
      renderColumnTitle,
      renderTable,
      configProvider: useConfigProvider()
    };
  },
  render() {
    const {
      prefixCls: customizePrefixCls,
      dropdownPrefixCls: customizeDropdownPrefixCls,
      transformCellText: customizeTransformCellText
    } = this;
    const data = this.getCurrentPageData();
    const {
      getPopupContainer: getContextPopupContainer,
      transformCellText: tct
    } = this.configProvider;
    const getPopupContainer = this.getPopupContainer || getContextPopupContainer;
    const transformCellText = customizeTransformCellText || tct;
    let loading = this.loading;
    if (typeof loading === 'boolean') {
      loading = {
        props: {
          spinning: loading
        }
      };
    } else {
      loading = {
        props: {...loading}
      };
    }
    const getPrefixCls = this.configProvider.getPrefixCls;
    const renderEmpty = this.configProvider.renderEmpty;

    const prefixCls = getPrefixCls('table', customizePrefixCls);
    const dropdownPrefixCls = getPrefixCls('dropdown', customizeDropdownPrefixCls);

    const table = (
        <LocaleReceiver
            componentName="Table"
            defaultLocale={defaultLocale.Table}
            children={locale =>
                this.renderTable({
                  prefixCls,
                  renderEmpty,
                  dropdownPrefixCls,
                  contextLocale: locale,
                  getPopupContainer,
                  transformCellText
                })
            }
        />
    );

    // if there is no pagination or no data,
    // the height of spin should decrease by half of pagination
    const paginationPatchClass =
        this.hasPagination() && data && data.length !== 0
            ? `${prefixCls}-with-pagination`
            : `${prefixCls}-without-pagination`;
    const spinProps = {
      ...loading,
      class:
          loading.props && loading.props.spinning
              ? `${paginationPatchClass} ${prefixCls}-spin-holder`
              : ''
    };
    return (
        <div class={classNames(`${prefixCls}-wrapper`)}>
          <Spin {...spinProps}>
            {this.renderPagination(prefixCls, 'top')}
            {table}
            {this.renderPagination(prefixCls, 'bottom')}
          </Spin>
        </div>
    );
  }
}) as any;
