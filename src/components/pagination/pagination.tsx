import {defineComponent, getCurrentInstance} from 'vue';
import {getListenersFromInstance} from '../_util/props-util';
import PropTypes from '../_util/vue-types';
import {useConfigProvider} from '../config-provider';
import Icon from '../icon';
import LocaleReceiver from '../locale-provider/locale-receiver';
import VcSelect from '../select';
import VcPagination from '../vc-pagination';
import enUS from '../vc-pagination/locale/zh_CN';
import MiniSelect from './mini-select';

export const PaginationProps = () => ({
  total: PropTypes.number,
  defaultCurrent: PropTypes.number,
  disabled: PropTypes.bool,
  current: PropTypes.number,
  defaultPageSize: PropTypes.number,
  pageSize: PropTypes.number,
  hideOnSinglePage: PropTypes.bool,
  showSizeChanger: PropTypes.bool,
  pageSizeOptions: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.number, PropTypes.string])),
  buildOptionText: PropTypes.func,
  showSizeChange: PropTypes.func,
  showQuickJumper: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
  showTotal: PropTypes.any,
  size: PropTypes.string,
  simple: PropTypes.bool,
  locale: PropTypes.object,
  prefixCls: PropTypes.string,
  selectPrefixCls: PropTypes.string,
  itemRender: PropTypes.any,
  role: PropTypes.string,
  showLessItems: PropTypes.bool
});

export const PaginationConfig = () => ({
  ...PaginationProps(),
  position: PropTypes.oneOf(['top', 'bottom', 'both'])
});

export default defineComponent({
  name: 'APagination',
  model: {
    prop: 'current',
    event: 'change.current'
  },
  props: {
    ...PaginationProps()
  },
  setup(props, {slots}) {

    const getIconsProps = (prefixCls) => {
      const prevIcon = (
          <a class={`${prefixCls}-item-link`}>
            <Icon type="left"/>
          </a>
      );
      const nextIcon = (
          <a class={`${prefixCls}-item-link`}>
            <Icon type="right"/>
          </a>
      );
      const jumpPrevIcon = (
          <a class={`${prefixCls}-item-link`}>
            {/* You can use transition effects in the container :) */}
            <div class={`${prefixCls}-item-container`}>
              <Icon class={`${prefixCls}-item-link-icon`} type="double-left"/>
              <span class={`${prefixCls}-item-ellipsis`}>•••</span>
            </div>
          </a>
      );
      const jumpNextIcon = (
          <a class={`${prefixCls}-item-link`}>
            {/* You can use transition effects in the container :) */}
            <div class={`${prefixCls}-item-container`}>
              <Icon class={`${prefixCls}-item-link-icon`} type="double-right"/>
              <span class={`${prefixCls}-item-ellipsis`}>•••</span>
            </div>
          </a>
      );
      return {
        prevIcon,
        nextIcon,
        jumpPrevIcon,
        jumpNextIcon
      };
    };
    const configProvider = useConfigProvider();
    const renderPagination = (contextLocale) => {
      const {
        prefixCls: customizePrefixCls,
        selectPrefixCls: customizeSelectPrefixCls,
        buildOptionText,
        size,
        locale: customLocale,
        ...restProps
      } = props;
      const getPrefixCls = configProvider.getPrefixCls;
      const prefixCls = getPrefixCls('pagination', customizePrefixCls);
      const selectPrefixCls = getPrefixCls('select', customizeSelectPrefixCls);

      const isSmall = size === 'small';
      const paginationProps = {
        prefixCls,
        selectPrefixCls,
        ...restProps,
        ...getIconsProps(prefixCls),
        selectComponentClass: isSmall ? MiniSelect : VcSelect,
        locale: {...contextLocale, ...customLocale},
        buildOptionText: buildOptionText || slots.buildOptionText,
        class: {
          mini: isSmall
        },
        ...getListenersFromInstance(getCurrentInstance())
      };

      return <VcPagination {...paginationProps} />;
    };


    return {
      getIconsProps,
      renderPagination
    };
  },
  render() {
    return (
        <LocaleReceiver
            componentName="Pagination"
            defaultLocale={enUS}
            slots={{default: this.renderPagination}}
        />
    );
  }
}) as any;
