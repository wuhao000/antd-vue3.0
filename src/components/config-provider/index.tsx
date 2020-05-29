import {App, defineComponent, getCurrentInstance, inject, provide} from 'vue';
import {filterEmpty, getComponentFromProp} from '../_util/props-util';
import Base from '../base';
import LocaleProvider, {ANT_MARK} from '../locale-provider';
import LocaleReceiver from '../locale-provider/locale-receiver';
import defaultRenderEmpty from './renderEmpty';


const ConfigProvider = defineComponent({
  name: 'AConfigProvider',
  setup(props: {
    getPopupContainer: () => any, prefixCls: string,
    renderEmpty: () => any, csp: object,
    autoInsertSpaceInButton: boolean,
    locale: object, pageHeader: any
  }, ctx) {
    const componentInstance = getCurrentInstance();
    const renderEmptyComponent = (name) => {
      const renderEmpty =
        getComponentFromProp(componentInstance, 'renderEmpty', {}, false) || defaultRenderEmpty;
      return renderEmpty(name);
    };
    const getPrefixCls = (suffixCls, customizePrefixCls) => {
      const {prefixCls = 'ant'} = props;
      if (customizePrefixCls) {
        return customizePrefixCls;
      }
      return suffixCls ? `${prefixCls}-${suffixCls}` : prefixCls;
    };
    provide('configProvider', {
      ...props, getPrefixCls, renderEmptyComponent
    });

    const renderProvider = (legacyLocale) => {
      return (
        <LocaleProvider locale={props.locale || legacyLocale} _ANT_MARK__={ANT_MARK}>
          {ctx.slots.default ? filterEmpty(ctx.slots.default)[0] : null}
        </LocaleProvider>
      );
    };
    return {renderProvider};
  },
  render() {
    return (
      <LocaleReceiver
        scopedSlots={{default: (_, __, legacyLocale) => this.renderProvider(legacyLocale)}}
      />
    );
  }
});

export interface IConfigProvider {
  readonly getPrefixCls: (suffixCls, customizePrefixCls?) => (any | string);
  readonly renderEmpty: (componentName) => any;
  readonly autoInsertSpaceInButton: boolean;
  readonly csp?: any;
  readonly getPopupContainer: (...args: any) => any;
  transformCellText?: Function;
}

export const ConfigConsumerProps: IConfigProvider = {
  getPrefixCls: (suffixCls, customizePrefixCls) => {
    if (customizePrefixCls) {
      return customizePrefixCls;
    }
    return `ant-${suffixCls}`;
  },
  renderEmpty: defaultRenderEmpty,
  autoInsertSpaceInButton: true,
  getPopupContainer: () => document.body
};

export const useConfigProvider = () => inject('configProvider', ConfigConsumerProps) as IConfigProvider;

/* istanbul ignore next */
ConfigProvider.install = function(app: App) {
  app.use(Base);
  app.component(ConfigProvider.name, ConfigProvider);
};

export default ConfigProvider;
