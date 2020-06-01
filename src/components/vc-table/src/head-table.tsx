import classNames from 'classnames';
import {CSSProperties} from 'vue';
import PropTypes from '../../_util/vue-types';
import BaseTable from './base-table';
import {measureScrollbar} from './utils';
import { useTable } from './table';

export default {
  name: 'HeadTable',
  props: {
    fixed: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    columns: PropTypes.array.isRequired,
    tableClassName: PropTypes.string.isRequired,
    handleBodyScrollLeft: PropTypes.func.isRequired,
    expander: PropTypes.object.isRequired
  },
  setup() {
    return {
      table: useTable()
    };
  },
  render(ctx) {
    const {columns, fixed, tableClassName, handleBodyScrollLeft, expander, table} = ctx;
    const {prefixCls, scroll, showHeader, saveRef} = table.ctx;
    let {useFixedHeader} = table;
    const headStyle: CSSProperties = {};

    const scrollbarWidth = measureScrollbar({direction: 'vertical'});

    if (scroll.y) {
      useFixedHeader = true;
      // https://github.com/ant-design/ant-design/issues/17051
      const scrollbarWidthOfHeader = measureScrollbar({direction: 'horizontal', prefixCls});
      // Add negative margin bottom for scroll bar overflow bug
      if (scrollbarWidthOfHeader > 0 && !fixed) {
        headStyle.marginBottom = `-${scrollbarWidthOfHeader}px`;
        headStyle.paddingBottom = '0px';
        // https://github.com/ant-design/ant-design/pull/19986
        headStyle.minWidth = `${scrollbarWidth}px`;
        // https://github.com/ant-design/ant-design/issues/17051
        headStyle.overflowX = 'auto';
        headStyle.overflowY = scrollbarWidth === 0 ? 'hidden' : 'auto';
      }
    }

    if (!useFixedHeader || !showHeader) {
      return null;
    }
    return (
        <div
            key="headTable"
            ref={fixed ? () => {
            } : saveRef('headTable')}
            class={classNames(`${prefixCls}-header`, {
              [`${prefixCls}-hide-scrollbar`]: scrollbarWidth > 0
            })}
            style={headStyle}
            onScroll={handleBodyScrollLeft}>
          <BaseTable
              tableClassName={tableClassName}
              hasHead={true}
              hasBody={false}
              fixed={fixed}
              columns={columns}
              expander={expander}/>
        </div>
    );
  }
} as any;
