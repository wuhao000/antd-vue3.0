/* eslint-disable camelcase */
import {useRefs} from '@/components/vc-tabs/src/save-ref';
import classNames from 'classnames';
import classes from 'component-classes';
import merge from 'lodash/merge';
import shallowequal from 'shallowequal';
import {
  ComponentInternalInstance,
  defineComponent,
  getCurrentInstance,
  inject,
  nextTick,
  onBeforeUnmount,
  onMounted,
  onUpdated,
  provide,
  reactive,
  ref,
  watch
} from 'vue';
import {getListenersFromInstance, getOptionProps, initDefaultProps} from '../../_util/props-util';
import {create, Store} from '../../_util/store';
import PropTypes from '../../_util/vue-types';
import warning from '../../_util/warning';
import addEventListener from '../../vc-util/Dom/addEventListener';
import BodyTable from './body-table';
import ColumnManager from './column-manager';
import ExpandableTable from './expandable-table';
import HeadTable from './head-table';
import {debounce} from './utils';

export const useTable = () => {
  return inject('table', {}) as ComponentInternalInstance
      & { ctx: any };
};

export const useState = () => {
  return inject('store') as Store;
};

export default defineComponent({
  name: 'Table',
  props: initDefaultProps(
      {
        store: PropTypes.object,
        data: PropTypes.array,
        useFixedHeader: PropTypes.bool,
        columns: PropTypes.array,
        prefixCls: PropTypes.string,
        bodyStyle: PropTypes.object,
        rowKey: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
        rowClassName: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
        customRow: PropTypes.func,
        customHeaderRow: PropTypes.func,
        // onRowClick: PropTypes.func,
        // onRowDoubleClick: PropTypes.func,
        // onRowContextMenu: PropTypes.func,
        // onRowMouseEnter: PropTypes.func,
        // onRowMouseLeave: PropTypes.func,
        showHeader: PropTypes.bool,
        title: PropTypes.func,
        id: PropTypes.string,
        footer: PropTypes.func,
        emptyText: PropTypes.any,
        scroll: PropTypes.object,
        rowRef: PropTypes.func,
        getBodyWrapper: PropTypes.func,
        components: PropTypes.shape({
          table: PropTypes.any,
          header: PropTypes.shape({
            wrapper: PropTypes.any,
            row: PropTypes.any,
            cell: PropTypes.any
          }),
          body: PropTypes.shape({
            wrapper: PropTypes.any,
            row: PropTypes.any,
            cell: PropTypes.any
          })
        }),
        expandIcon: PropTypes.any,
        expandIconAsCell: PropTypes.bool,
        expandedRowKeys: PropTypes.array,
        expandedRowClassName: PropTypes.func,
        defaultExpandAllRows: PropTypes.bool,
        defaultExpandedRowKeys: PropTypes.array,
        expandIconColumnIndex: PropTypes.number,
        expandedRowRender: PropTypes.func,
        childrenColumnName: PropTypes.string,
        indentSize: PropTypes.number,
        expandRowByClick: PropTypes.bool,
        tableLayout: PropTypes.string,
        transformCellText: PropTypes.func
      },
      {
        data: [],
        useFixedHeader: false,
        rowKey: 'key',
        rowClassName: () => '',
        prefixCls: 'rc-table',
        bodyStyle: {},
        showHeader: true,
        scroll: {},
        rowRef: () => null,
        emptyText: () => 'No Data',
        customHeaderRow: () => () => {
        }
      }
  ),
  setup($props, {emit}) {
    const instance = getCurrentInstance();
    provide('table', instance);
    const {saveRef, getRefs, getRef} = useRefs();
    const sComponents = ref(undefined);
    const store = $props.store || create({});
    store.setState({
      currentHoverKey: null,
      fixedColumnsHeadRowsHeight: [],
      fixedColumnsBodyRowsHeight: {}
    });
    watch(() => $props.columns, (val) => {
      if (val) {
        columnManager.reset(val);
      }
    });
    watch(() => $props.data, (val) => {
      if (val.length === 0 && hasScrollX()) {
        nextTick(() => {
          resetScrollX();
        });
      }
    });
    watch(() => $props.components, (val) => {
      sComponents.value = merge(
          {
            table: 'table',
            header: {
              wrapper: 'thead',
              row: 'tr',
              cell: 'th'
            },
            body: {
              wrapper: 'tbody',
              row: 'tr',
              cell: 'td'
            }
          },
          val
      );
    }, {immediate: true});
    const preData = ref([...$props.data]);
    const scrollPosition = ref(undefined);
    const tableNode = ref(undefined);
    const columnManager = new ColumnManager($props.columns);
    const getRowKey = (record, index) => {
      const rowKey = $props.rowKey;
      const key = typeof rowKey === 'function' ? rowKey(record, index) : record[rowKey];
      warning(
          key !== undefined,
          'Each record in table should have a unique `key` prop,' +
          'or set `rowKey` to an unique primary key.'
      );
      return key === undefined ? index : key;
    };
    const setScrollPosition = (position) => {
      scrollPosition.value = position;
      if (tableNode.value) {
        const {prefixCls} = $props;
        if (position === 'both') {
          classes(tableNode.value)
              .remove(new RegExp(`^${prefixCls}-scroll-position-.+$`))
              .add(`${prefixCls}-scroll-position-left`)
              .add(`${prefixCls}-scroll-position-right`);
        } else {
          classes(tableNode.value)
              .remove(new RegExp(`^${prefixCls}-scroll-position-.+$`))
              .add(`${prefixCls}-scroll-position-${position}`);
        }
      }
    };
    const setScrollPositionClassName = () => {
      const node = getRef('bodyTable');
      const scrollToLeft = node.scrollLeft === 0;
      const scrollToRight =
          node.scrollLeft + 1 >=
          node.children[0].getBoundingClientRect().width - node.getBoundingClientRect().width;
      if (scrollToLeft && scrollToRight) {
        setScrollPosition('both');
      } else if (scrollToLeft) {
        setScrollPosition('left');
      } else if (scrollToRight) {
        setScrollPosition('right');
      } else if (scrollPosition.value !== 'middle') {
        setScrollPosition('middle');
      }
    };
    const isTableLayoutFixed = () => {
      const {tableLayout, columns = [], useFixedHeader, scroll = {}} = $props;
      if (typeof tableLayout !== 'undefined') {
        return tableLayout === 'fixed';
      }
      // if one column is ellipsis, use fixed table layout to fix align issue
      if (columns.some(({ellipsis}) => !!ellipsis)) {
        return true;
      }
      // if header fixed, use fixed table layout to fix align issue
      if (useFixedHeader || scroll.y) {
        return true;
      }
      // if scroll.x is number/px/% width value, we should fixed table layout
      // to avoid long word layout broken issue
      return scroll.x && scroll.x !== true && scroll.x !== 'max-content';
    };
    const handleWindowResize = () => {
      syncFixedTableRowHeight();
      setScrollPositionClassName();
    };
    const syncFixedTableRowHeight = () => {
      const tableRect = tableNode.value.getBoundingClientRect();
      // If tableNode's height less than 0, suppose it is hidden and don't recalculate rowHeight.
      // see: https://github.com/ant-design/ant-design/issues/4836
      if (tableRect.height !== undefined && tableRect.height <= 0) {
        return;
      }
      const {prefixCls} = $props;
      const headRows = getRef('headTable')
          ? getRef('headTable').querySelectorAll('thead')
          : getRef('bodyTable').querySelectorAll('thead');
      const bodyRows = getRef('bodyTable').querySelectorAll(`.${prefixCls}-row`) || [];
      const fixedColumnsHeadRowsHeight = [].map.call(headRows, (row: any) =>
          row.getBoundingClientRect().height ? row.getBoundingClientRect().height - 0.5 : 'auto'
      );
      const state = store.getState();
      const fixedColumnsBodyRowsHeight = [].reduce.call(
          bodyRows,
          (acc, row: any) => {
            const rowKey = row.getAttribute('data-row-key');
            acc[rowKey] = row.getBoundingClientRect().height ||
                state.fixedColumnsBodyRowsHeight[rowKey] ||
                'auto';
            return acc;
          },
          {}
      );
      if (
          shallowequal(state.fixedColumnsHeadRowsHeight, fixedColumnsHeadRowsHeight) &&
          shallowequal(state.fixedColumnsBodyRowsHeight, fixedColumnsBodyRowsHeight)
      ) {
        return;
      }
      store.setState({
        fixedColumnsHeadRowsHeight,
        fixedColumnsBodyRowsHeight
      });
    };
    const resetScrollX = () => {
      if (getRef('headTable')) {
        getRef('headTable').scrollLeft = 0;
      }
      if (getRef('bodyTable')) {
        getRef('bodyTable').scrollLeft = 0;
      }
    };
    const hasScrollX = () => {
      const {scroll = {}} = $props;
      return 'x' in scroll;
    };
    const lastScrollLeft = ref(undefined);
    const handleBodyScrollLeft = (e) => {
      // Fix https://github.com/ant-design/ant-design/issues/7635
      if (e.currentTarget !== e.target) {
        return;
      }
      const target = e.target;
      const {scroll = {}} = $props;
      const ref_headTable = getRef('headTable');
      const ref_bodyTable = getRef('bodyTable');
      if (target.scrollLeft !== lastScrollLeft.value && scroll.x) {
        if (target === ref_bodyTable && ref_headTable) {
          ref_headTable.scrollLeft = target.scrollLeft;
        } else if (target === ref_headTable && ref_bodyTable) {
          ref_bodyTable.scrollLeft = target.scrollLeft;
        }
        setScrollPositionClassName();
      }
      // Remember last scrollLeft for scroll direction detecting.
      lastScrollLeft.value = target.scrollLeft;
    };
    const lastScrollTop = ref(undefined);
    const handleBodyScrollTop = (e) => {
      const target = e.target;
      // Fix https://github.com/ant-design/ant-design/issues/9033
      if (e.currentTarget !== target) {
        return;
      }
      const {scroll = {}} = $props;
      const ref_headTable = getRef('headTable');
      const ref_bodyTable = getRef('bodyTable');
      const ref_fixedColumnsBodyLeft = getRef('fixedColumnsBodyLeft');
      const ref_fixedColumnsBodyRight = getRef('fixedColumnsBodyRight');
      if (target.scrollTop !== lastScrollTop.value && scroll.y && target !== ref_headTable) {
        const scrollTop = target.scrollTop;
        if (ref_fixedColumnsBodyLeft && target !== ref_fixedColumnsBodyLeft) {
          ref_fixedColumnsBodyLeft.scrollTop = scrollTop;
        }
        if (ref_fixedColumnsBodyRight && target !== ref_fixedColumnsBodyRight) {
          ref_fixedColumnsBodyRight.scrollTop = scrollTop;
        }
        if (ref_bodyTable && target !== ref_bodyTable) {
          ref_bodyTable.scrollTop = scrollTop;
        }
      }
      // Remember last scrollTop for scroll direction detecting.
      lastScrollTop.value = target.scrollTop;
    };
    const handleBodyScroll = (e) => {
      handleBodyScrollLeft(e);
      handleBodyScrollTop(e);
    };
    const handleWheel = (event) => {
      const {scroll = {}} = $props;
      if (window.navigator.userAgent.match(/Trident\/7\./) && scroll.y) {
        event.preventDefault();
        const wd = event.deltaY;
        const target = event.target;
        const {
          ref_bodyTable: bodyTable,
          ref_fixedColumnsBodyLeft: fixedColumnsBodyLeft,
          ref_fixedColumnsBodyRight: fixedColumnsBodyRight
        } = getRefs();
        let scrollTop = 0;

        if (lastScrollTop.value) {
          scrollTop = lastScrollTop.value + wd;
        } else {
          scrollTop = wd;
        }

        if (fixedColumnsBodyLeft && target !== fixedColumnsBodyLeft) {
          fixedColumnsBodyLeft.scrollTop = scrollTop;
        }
        if (fixedColumnsBodyRight && target !== fixedColumnsBodyRight) {
          fixedColumnsBodyRight.scrollTop = scrollTop;
        }
        if (bodyTable && target !== bodyTable) {
          bodyTable.scrollTop = scrollTop;
        }
      }
    };
    const saveTableNodeRef = (node) => {
      tableNode.value = node;
    };
    const renderMainTable = () => {
      const {scroll, prefixCls} = $props;
      const isAnyColumnsFixed = columnManager.isAnyColumnsFixed();
      const scrollable = isAnyColumnsFixed || scroll.x || scroll.y;

      const table = [
        renderTable({
          columns: columnManager.groupedColumns(),
          isAnyColumnsFixed
        }),
        renderEmptyText(),
        renderFooter()
      ];

      return scrollable ? <div class={`${prefixCls}-scroll`}>{table}</div> : table;
    };
    const renderLeftFixedTable = () => {
      const {prefixCls} = $props;

      return (
          <div class={`${prefixCls}-fixed-left`}>
            {renderTable({
              columns: columnManager.leftColumns(),
              fixed: 'left'
            })}
          </div>
      );
    };
    const renderRightFixedTable = () => {
      const {prefixCls} = $props;

      return (
          <div class={`${prefixCls}-fixed-right`}>
            {renderTable({
              columns: columnManager.rightColumns(),
              fixed: 'right'
            })}
          </div>
      );
    };
    const renderTable = (options) => {
      const {columns, fixed, isAnyColumnsFixed} = options;
      const {prefixCls, scroll = {}} = $props;
      const tableClassName = scroll.x || fixed ? `${prefixCls}-fixed` : '';

      const headTable = (
          <HeadTable
              key="head"
              columns={columns}
              fixed={fixed}
              tableClassName={tableClassName}
              handleBodyScrollLeft={handleBodyScrollLeft}
              expander={expander.value}
          />
      );
      const bodyTable = (
          <BodyTable
              key="body"
              columns={columns}
              fixed={fixed}
              tableClassName={tableClassName}
              getRowKey={getRowKey}
              handleWheel={handleWheel}
              handleBodyScroll={handleBodyScroll}
              expander={expander.value}
              isAnyColumnsFixed={isAnyColumnsFixed}
          />
      );
      return [headTable, bodyTable];
    };
    const renderTitle = () => {
      const {title, prefixCls, data} = $props;
      return title ? (
          <div class={`${prefixCls}-title`} key="title">
            {title(data)}
          </div>
      ) : null;
    };
    const renderFooter = () => {
      const {footer, prefixCls, data} = $props;
      return footer ? (
          <div class={`${prefixCls}-footer`} key="footer">
            {footer(data)}
          </div>
      ) : null;
    };
    const expander = ref(undefined);
    const setExpander = (exp) => {
      expander.value = exp;
    };
    const renderEmptyText = () => {
      const {emptyText, prefixCls, data} = $props;
      if (data.length) {
        return null;
      }
      const emptyClassName = `${prefixCls}-placeholder`;
      return (
          <div class={emptyClassName} key="emptyText">
            {typeof emptyText === 'function' ? emptyText() : emptyText}
          </div>
      );
    };
    const debouncedWindowResize = debounce(handleWindowResize, 150);
    const resizeEvent = ref(undefined);
    onMounted(() => {
      nextTick(() => {
        if (columnManager.isAnyColumnsFixed()) {
          handleWindowResize();
          resizeEvent.value = addEventListener(window, 'resize', debouncedWindowResize);
        }
        // https://github.com/ant-design/ant-design/issues/11635
        if (getRef('headTable')) {
          getRef('headTable').scrollLeft = 0;
        }
        if (getRef('bodyTable')) {
          getRef('bodyTable').scrollLeft = 0;
        }
      });
    });
    onUpdated(() => {
      nextTick(() => {
        if (columnManager.isAnyColumnsFixed()) {
          handleWindowResize();
          if (!resizeEvent.value) {
            resizeEvent.value = addEventListener(window, 'resize', debouncedWindowResize);
          }
        }
      });
    });
    onBeforeUnmount(() => {
      if (resizeEvent.value) {
        resizeEvent.value.remove();
      }
      if (debouncedWindowResize) {
        debouncedWindowResize.cancel();
      }
    });
    setScrollPosition('left');
    provide('store', reactive(store));
    return {
      getRowKey,
      setScrollPosition,
      setScrollPositionClassName,
      isTableLayoutFixed,
      handleWindowResize,
      syncFixedTableRowHeight,
      resetScrollX,
      hasScrollX,
      handleBodyScrollLeft,
      handleBodyScrollTop,
      handleBodyScroll,
      handleWheel,
      saveRef,
      sComponents,
      getRef,
      saveTableNodeRef,
      renderMainTable,
      renderLeftFixedTable,
      renderRightFixedTable,
      renderTable,
      renderTitle,
      renderFooter,
      columnManager,
      renderEmptyText,
      setExpander
    };
  },
  render() {
    const instance = getCurrentInstance();
    const props = getOptionProps(instance);
    const {columnManager, getRowKey} = this;
    const prefixCls = props.prefixCls;
    const tableClassName = classNames(props.prefixCls, {
      [`${prefixCls}-fixed-header`]: props.useFixedHeader || (props.scroll && props.scroll.y),
      [`${prefixCls}-scroll-position-left ${prefixCls}-scroll-position-right`]:
      this.scrollPosition === 'both',
      [`${prefixCls}-scroll-position-${this.scrollPosition}`]: this.scrollPosition !== 'both',
      [`${prefixCls}-layout-fixed`]: this.isTableLayoutFixed()
    }, instance.attrs.class);

    const hasLeftFixed = columnManager.isAnyColumnsLeftFixed();
    const hasRightFixed = columnManager.isAnyColumnsRightFixed();

    const expandableTableProps = {
      ...props,
      columnManager,
      getRowKey,
      ...getListenersFromInstance(instance)
    };
    return <ExpandableTable slots={{
      default: expander => {
        this.setExpander(expander);
        return (
            <div ref={this.saveTableNodeRef}
                 class={tableClassName}>
              {this.renderTitle()}
              <div class={`${prefixCls}-content`}>
                {this.renderMainTable()}
                {hasLeftFixed && this.renderLeftFixedTable()}
                {hasRightFixed && this.renderRightFixedTable()}
              </div>
            </div>
        );
      }
    }}{...expandableTableProps} />;
  }
});
